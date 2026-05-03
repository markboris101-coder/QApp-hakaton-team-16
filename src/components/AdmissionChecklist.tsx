import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TFunction } from "i18next";
import type { DocumentStatus, DocumentUploadMeta, StudentDocuments } from "../mockData";
import { useTranslation } from "react-i18next";
import { DOCUMENT_FILE_ACCEPT, validateDocumentFile } from "../lib/documentUploadPolicy";
import { recordChecklistReadyPeak } from "../lib/demoAnalytics";
import { DOCUMENT_ENTRIES, type DocumentLane } from "./documentLabels";
import {
  computeDocsInsight,
  countDocumentStates,
  daysUntilDeadlineIso,
  entriesGroupedByLane,
  pickRecommendedDocument,
} from "../lib/documentPlan";

type Props = {
  documents: StudentDocuments;
  documentUploads: Partial<Record<keyof StudentDocuments, DocumentUploadMeta>>;
  onSelectFile: (key: keyof StudentDocuments, file: File) => Promise<void>;
  onRemoveFile: (key: keyof StudentDocuments) => Promise<void>;
  onDownloadFile: (key: keyof StudentDocuments) => Promise<void>;
  applicationDeadlineIso: string;
  /** Якорь для быстрых ссылок с других страниц */
  sectionId?: string;
};

const STATUS_ORDER: DocumentStatus[] = ["MISSING", "PENDING", "READY"];

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function readVerifyList(t: TFunction, key: string): string[] {
  const raw = t(`documentsChecklist.verify.${key}`, { returnObjects: true });
  return Array.isArray(raw) ? (raw as string[]).filter((x) => typeof x === "string") : [];
}

function LaneIcon({ lane }: { lane: DocumentLane }) {
  const base =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-inner [&_svg]:h-5 [&_svg]:w-5";
  if (lane === "identity")
    return (
      <span className={`${base} bg-slate-900`} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="12" cy="11" r="2.25" />
          <path strokeLinecap="round" d="M8 17h8" />
        </svg>
      </span>
    );
  if (lane === "academicRecords")
    return (
      <span className={`${base} bg-indigo-600`} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h11M8 12h11M8 18h7M5 6h.01M5 12h.01M5 18h.01" />
        </svg>
      </span>
    );
  if (lane === "health")
    return (
      <span className={`${base} bg-teal-600`} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
        </svg>
      </span>
    );
  return (
    <span className={`${base} bg-violet-600`} aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="4" y="6" width="16" height="13" rx="2" />
        <circle cx="12" cy="11.5" r="3" />
      </svg>
    </span>
  );
}

export function AdmissionChecklist({
  documents,
  documentUploads,
  onSelectFile,
  onRemoveFile,
  onDownloadFile,
  applicationDeadlineIso,
  sectionId = "admission-checklist",
}: Props) {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickKey, setPickKey] = useState<keyof StudentDocuments | null>(null);
  const [filter, setFilter] = useState<"all" | "missing" | "ready">("all");
  const [expandedVerify, setExpandedVerify] = useState<Partial<Record<keyof StudentDocuments, boolean>>>({});
  const [dragOverKey, setDragOverKey] = useState<keyof StudentDocuments | null>(null);

  const { ready, missing, pending, total } = useMemo(() => countDocumentStates(documents), [documents]);
  const progressPct = total > 0 ? Math.round((ready / total) * 100) : 0;

  const daysLeft = useMemo(() => daysUntilDeadlineIso(applicationDeadlineIso), [applicationDeadlineIso]);
  const insight = useMemo(() => computeDocsInsight(documents, daysLeft), [documents, daysLeft]);
  const recommendedKey = useMemo(
    () => pickRecommendedDocument(documents, daysLeft),
    [documents, daysLeft]
  );

  const locale = i18n.language.startsWith("kk") ? "kk-KZ" : i18n.language.startsWith("ru") ? "ru-RU" : "en-US";
  const formatDeadline = useCallback(
    (iso: string) => {
      const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
      return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
    },
    [locale]
  );

  useEffect(() => {
    recordChecklistReadyPeak(ready);
  }, [ready]);

  const statusLabel = useCallback(
    (st: DocumentStatus) => {
      if (st === "READY") return t("documentsChecklist.statusReady");
      if (st === "PENDING") return t("documentsChecklist.statusPending");
      return t("documentsChecklist.statusMissing");
    },
    [t]
  );

  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    items: DOCUMENT_ENTRIES.filter((e) => documents[e.key] === status),
  })).filter((g) => g.items.length > 0);

  const laneBlocks = useMemo(() => entriesGroupedByLane(filter, documents), [filter, documents]);

  const openPicker = (key: keyof StudentDocuments) => {
    setPickKey(key);
    requestAnimationFrame(() => fileInputRef.current?.click());
  };

  const tryAssignFile = async (key: keyof StudentDocuments, file: File | undefined) => {
    if (!file) return;
    const v = validateDocumentFile(file);
    if (!v.ok) {
      window.alert(v.message);
      return;
    }
    await onSelectFile(key, file);
  };

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = pickKey;
    e.target.value = "";
    setPickKey(null);
    if (!file || !key) return;
    await tryAssignFile(key, file);
  };

  const onDropOnCard = async (key: keyof StudentDocuments, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverKey(null);
    if (documents[key] === "PENDING") return;
    const file = e.dataTransfer.files?.[0];
    await tryAssignFile(key, file);
  };

  const insightTone =
    insight.kind === "complete"
      ? "border-emerald-200 bg-emerald-50/90 text-emerald-950"
      : insight.kind === "deadlinePassed"
        ? "border-slate-300 bg-slate-100 text-slate-900"
        : insight.kind === "critical"
          ? "border-rose-300 bg-gradient-to-br from-rose-50 to-orange-50 text-rose-950"
          : insight.kind === "soon"
            ? "border-amber-200 bg-amber-50/90 text-amber-950"
            : "border-indigo-200 bg-indigo-50/80 text-indigo-950";

  const insightBody = (() => {
    const mc = missing;
    if (insight.kind === "complete") return t("documentsChecklist.insightComplete");
    if (insight.kind === "deadlinePassed") return t("documentsChecklist.insightDeadlinePassed", { missing: mc });
    if (insight.kind === "critical") return t("documentsChecklist.insightCritical", { missing: mc });
    if (insight.kind === "soon") return t("documentsChecklist.insightSoon", { days: insight.daysLeft, missing: mc });
    return t("documentsChecklist.insightSteady", { days: insight.daysLeft, missing: mc });
  })();

  const medicalNeedsLead =
    documents.medicalCertificate === "MISSING" && daysLeft >= 0 && daysLeft <= 21 && insight.kind !== "complete";

  const recommendedEntry = recommendedKey ? DOCUMENT_ENTRIES.find((e) => e.key === recommendedKey) : undefined;

  const toggleVerify = (key: keyof StudentDocuments) => {
    setExpandedVerify((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section id={sectionId} className="scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept={DOCUMENT_FILE_ACCEPT}
        aria-hidden
        tabIndex={-1}
        onChange={onInputChange}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{t("documentsChecklist.kicker")}</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">{t("documentsChecklist.title")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{t("documentsChecklist.subtitle")}</p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-3 sm:max-w-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {t("documentsChecklist.deadlineLine")}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{formatDeadline(applicationDeadlineIso)}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
                daysLeft < 0 ? "bg-slate-200 text-slate-800" : daysLeft <= 7 ? "bg-rose-100 text-rose-800" : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {daysLeft < 0 ? t("documentsChecklist.daysPassed") : t("documentsChecklist.daysLeft", { count: daysLeft })}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white px-2 py-2 ring-1 ring-slate-200/80">
              <p className="text-lg font-bold tabular-nums text-emerald-700">{ready}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{t("documentsChecklist.statsReady")}</p>
            </div>
            <div className="rounded-xl bg-white px-2 py-2 ring-1 ring-slate-200/80">
              <p className="text-lg font-bold tabular-nums text-amber-700">{missing + pending}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{t("documentsChecklist.statsTodo")}</p>
            </div>
            <div className="rounded-xl bg-white px-2 py-2 ring-1 ring-slate-200/80">
              <p className="text-lg font-bold tabular-nums text-slate-800">{pending}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{t("documentsChecklist.statsPending")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", "missing", "ready"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === f ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {f === "all" ? t("documentsChecklist.filterAll") : f === "missing" ? t("documentsChecklist.filterTodo") : t("documentsChecklist.filterDone")}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("documentsChecklist.progressLabel")}</p>
          <p className="text-xs tabular-nums text-slate-600">
            {ready}/{total} · {progressPct}%
          </p>
        </div>
        <div
          className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("documentsChecklist.progressAria", { pct: progressPct })}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm ring-1 ring-black/5 ${insightTone}`}>
        <p>{insightBody}</p>
        {medicalNeedsLead ? <p className="mt-2 font-medium">{t("documentsChecklist.insightMedicalLead")}</p> : null}
      </div>

      {recommendedEntry && documents[recommendedEntry.key] === "MISSING" ? (
        <div className="mt-6 rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-5 shadow-md ring-1 ring-indigo-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("documentsChecklist.nextStep")}</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{t(`documentEntries.${recommendedEntry.key}`)}</p>
          <p className="mt-1 text-sm text-slate-600">{t(`documentsChecklist.hints.${recommendedEntry.key}`)}</p>
          <button
            type="button"
            onClick={() => openPicker(recommendedEntry.key)}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            {t("documentsChecklist.uploadThis")}
          </button>
        </div>
      ) : null}

      {!recommendedEntry && ready === total ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-900 ring-1 ring-emerald-100">
          {t("documentsChecklist.packCompleteHint")}
        </div>
      ) : null}

      <div className="mt-10 space-y-10">
        {laneBlocks.map(({ lane, items }) => (
          <div key={lane}>
            <div className="flex flex-wrap items-start gap-4 border-b border-slate-100 pb-4">
              <LaneIcon lane={lane} />
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-slate-900">{t(`documentsChecklist.lanes.${lane}.title`)}</h3>
                <p className="mt-1 text-sm text-slate-600">{t(`documentsChecklist.lanes.${lane}.blurb`)}</p>
              </div>
              <p className="text-xs font-semibold tabular-nums text-slate-500">
                {items.filter((e) => documents[e.key] === "READY").length}/{items.length}
              </p>
            </div>

            <ul className="mt-4 space-y-4">
              {items.map(({ key }) => {
                const st = documents[key];
                const meta = documentUploads[key];
                const verifyList = readVerifyList(t, key);
                const verifyOpen = expandedVerify[key];

                return (
                  <li
                    key={key}
                    className={`rounded-2xl border bg-slate-50/50 transition ${
                      dragOverKey === key ? "border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-200" : "border-slate-200/90"
                    }`}
                    onDragOver={(e) => {
                      if (st === "PENDING") return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "copy";
                      setDragOverKey(key);
                    }}
                    onDragLeave={() => setDragOverKey((k) => (k === key ? null : k))}
                    onDrop={(e) => void onDropOnCard(key, e)}
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{t(`documentEntries.${key}`)}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${
                              st === "READY"
                                ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
                                : st === "PENDING"
                                  ? "bg-amber-100 text-amber-900 ring-amber-200"
                                  : "bg-slate-100 text-slate-600 ring-slate-200"
                            }`}
                          >
                            {statusLabel(st)}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">{t(`documentsChecklist.hints.${key}`)}</p>

                        {verifyList.length > 0 ? (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => toggleVerify(key)}
                              className="text-xs font-semibold text-indigo-700 underline-offset-2 hover:underline"
                              aria-expanded={Boolean(verifyOpen)}
                            >
                              {verifyOpen ? t("documentsChecklist.verifyToggleHide") : t("documentsChecklist.verifyToggleShow")}
                            </button>
                            {verifyOpen ? (
                              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-slate-700">
                                {verifyList.map((line, i) => (
                                  <li key={i}>{line}</li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        ) : null}

                        <p className="mt-3 text-[11px] text-slate-400">{t("documentsChecklist.dropHint")}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        {st === "READY" && (
                          <>
                            <span
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                              aria-hidden
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            {meta ? (
                              <>
                                <span className="max-w-[180px] truncate text-sm text-slate-700" title={meta.fileName}>
                                  {meta.fileName}
                                </span>
                                <span className="text-xs tabular-nums text-slate-500">{formatBytes(meta.sizeBytes)}</span>
                                <button
                                  type="button"
                                  onClick={() => void onDownloadFile(key)}
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                                >
                                  {t("documentsChecklist.download")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openPicker(key)}
                                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                                >
                                  {t("documentsChecklist.replace")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void onRemoveFile(key)}
                                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                                >
                                  {t("documentsChecklist.remove")}
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openPicker(key)}
                                className="rounded-xl border border-dashed border-indigo-300 bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                              >
                                {t("documentsChecklist.attach")}
                              </button>
                            )}
                          </>
                        )}
                        {(st === "MISSING" || st === "PENDING") && (
                          <>
                            {st === "PENDING" ? (
                              <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 ring-1 ring-amber-200/80">
                                <span
                                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"
                                  aria-hidden
                                />
                                {t("documentsChecklist.saving")}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openPicker(key)}
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                              >
                                {t("documentsChecklist.upload")}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {filter !== "all" && laneBlocks.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-500">{t("documentsChecklist.filterEmpty")}</p>
      ) : null}

      {/* Компактный обзор по статусам (как раньше), если фильтр «Все» */}
      {filter === "all" && (
        <div className="mt-12 border-t border-slate-100 pt-10">
          <h3 className="text-sm font-semibold text-slate-800">{t("documentsChecklist.statusOverview")}</h3>
          <div className="mt-4 space-y-8">
            {byStatus.map((group) => (
              <div key={group.status}>
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">{statusLabel(group.status)}</h4>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {group.items.map((e) => (
                    <li
                      key={e.key}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800 ring-1 ring-slate-200/80"
                    >
                      {t(`documentEntries.${e.key}`)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
