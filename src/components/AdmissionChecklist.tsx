import React, { useEffect, useMemo, useRef, useState } from "react";
import type { DocumentStatus, DocumentUploadMeta, StudentDocuments } from "../mockData";
import { DOCUMENT_FILE_ACCEPT } from "../lib/documentUploadPolicy";
import { DOCUMENT_ENTRIES } from "./documentLabels";

type Props = {
  documents: StudentDocuments;
  documentUploads: Partial<Record<keyof StudentDocuments, DocumentUploadMeta>>;
  onSelectFile: (key: keyof StudentDocuments, file: File) => Promise<void>;
  onRemoveFile: (key: keyof StudentDocuments) => Promise<void>;
  onDownloadFile: (key: keyof StudentDocuments) => Promise<void>;
  /** Якорь для быстрых ссылок с других страниц */
  sectionId?: string;
};

/** Сначала то, что нужно загрузить */
const STATUS_ORDER: DocumentStatus[] = ["MISSING", "PENDING", "READY"];

const STATUS_LABELS_RU: Record<DocumentStatus, string> = {
  MISSING: "Нужно загрузить",
  PENDING: "Сохраняется",
  READY: "Готово",
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdmissionChecklist({
  documents,
  documentUploads,
  onSelectFile,
  onRemoveFile,
  onDownloadFile,
  sectionId = "admission-checklist",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickKey, setPickKey] = useState<keyof StudentDocuments | null>(null);

  const total = DOCUMENT_ENTRIES.length;
  const readyCount = DOCUMENT_ENTRIES.filter((e) => documents[e.key] === "READY").length;
  const missingCount = DOCUMENT_ENTRIES.filter((e) => documents[e.key] === "MISSING").length;
  const progressPct = total > 0 ? Math.round((readyCount / total) * 100) : 0;

  const nextMissing = useMemo(
    () => DOCUMENT_ENTRIES.find((e) => documents[e.key] === "MISSING"),
    [documents]
  );

  const [readyExpanded, setReadyExpanded] = useState(() => {
    const m = DOCUMENT_ENTRIES.filter((e) => documents[e.key] === "MISSING").length;
    return m === 0;
  });

  useEffect(() => {
    if (missingCount === 0) setReadyExpanded(true);
  }, [missingCount]);

  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS_RU[status],
    items: DOCUMENT_ENTRIES.filter((e) => documents[e.key] === status),
  })).filter((g) => g.items.length > 0);

  const openPicker = (key: keyof StudentDocuments) => {
    setPickKey(key);
    requestAnimationFrame(() => fileInputRef.current?.click());
  };

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = pickKey;
    e.target.value = "";
    setPickKey(null);
    if (!file || !key) return;
    await onSelectFile(key, file);
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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Документы для поступления</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Чек-лист документов</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Форматы: PDF, JPG, PNG — до 10 МБ на файл. Файлы хранятся локально в браузере (IndexedDB) вместе с профилем —
            прогресс сохраняется после обновления страницы.
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 lg:items-end">
          <p className="text-sm font-semibold tabular-nums text-slate-900">
            Готово {readyCount} из {total}
          </p>
          <p className="text-xs text-slate-500">{progressPct}% комплекта</p>
        </div>
      </div>

      <div className="mt-6">
        <div
          className="h-3 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Готовность документов: ${progressPct} процентов`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {nextMissing && (
        <div className="mt-8 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 ring-1 ring-indigo-100/80">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Следующий шаг</p>
          <p className="mt-2 text-base font-semibold text-slate-900">{nextMissing.labelRu}</p>
          <p className="mt-1 text-sm text-slate-600">{nextMissing.hintRu}</p>
          <button
            type="button"
            onClick={() => openPicker(nextMissing.key)}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            Загрузить этот документ
          </button>
        </div>
      )}

      {!nextMissing && readyCount === total && (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-900 ring-1 ring-emerald-100">
          Все документы отмечены как загруженные. Перед подачей проверьте актуальность требований приёмной комиссии.
        </div>
      )}

      <div className="mt-10 space-y-10">
        {byStatus.map((group) => {
          const isReadyGroup = group.status === "READY";
          const collapseReady = isReadyGroup && missingCount > 0;

          const list = (
            <ul className="mt-4 space-y-3">
              {group.items.map(({ key, label, labelRu, hintRu }) => {
                const st = documents[key];
                const meta = documentUploads[key];
                return (
                  <li
                    key={key}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{labelRu}</span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                          {label}
                        </span>
                      </span>
                      <span className="mt-2 block text-xs leading-relaxed text-slate-600">{hintRu}</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {st === "READY" && (
                        <>
                          <span
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                            aria-label="Загружено"
                            title="Загружено"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          {meta ? (
                            <>
                              <span className="max-w-[200px] truncate text-sm text-slate-700" title={meta.fileName}>
                                {meta.fileName}
                              </span>
                              <span className="text-xs tabular-nums text-slate-500">{formatBytes(meta.sizeBytes)}</span>
                              <button
                                type="button"
                                onClick={() => void onDownloadFile(key)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                              >
                                Скачать
                              </button>
                              <button
                                type="button"
                                onClick={() => openPicker(key)}
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                              >
                                Заменить
                              </button>
                              <button
                                type="button"
                                onClick={() => void onRemoveFile(key)}
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                              >
                                Удалить
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openPicker(key)}
                              className="rounded-xl border border-dashed border-indigo-300 bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                            >
                              Прикрепить файл
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
                              Сохранение…
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openPicker(key)}
                              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                            >
                              Загрузить
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          );

          if (collapseReady) {
            return (
              <div key={group.status}>
                <button
                  type="button"
                  onClick={() => setReadyExpanded((o) => !o)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                  aria-expanded={readyExpanded}
                >
                  <span>
                    {group.label} ({group.items.length})
                  </span>
                  <span className="text-slate-500" aria-hidden>
                    {readyExpanded ? "▼" : "▶"}
                  </span>
                </button>
                {readyExpanded ? list : null}
              </div>
            );
          }

          return (
            <div key={group.status}>
              <h3 className="text-sm font-semibold text-slate-800">{group.label}</h3>
              {list}
            </div>
          );
        })}
      </div>
    </section>
  );
}
