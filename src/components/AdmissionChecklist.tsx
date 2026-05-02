import React, { useRef, useState } from "react";
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

const STATUS_ORDER: DocumentStatus[] = ["READY", "MISSING", "PENDING"];

const STATUS_LABELS: Record<DocumentStatus, string> = {
  READY: "Ready",
  MISSING: "Missing",
  PENDING: "Pending",
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
  const progressPct = total > 0 ? Math.round((readyCount / total) * 100) : 0;

  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
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
    <section id={sectionId} className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm scroll-mt-24">
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept={DOCUMENT_FILE_ACCEPT}
        aria-hidden
        tabIndex={-1}
        onChange={onInputChange}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">10.F</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Admission requirements</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Supported formats: PDF, JPG, PNG — max 10 MB per file (ТЗ). Stored in this browser (IndexedDB) with your
            profile so progress survives refresh.
          </p>
        </div>
        <p className="text-sm font-medium tabular-nums text-slate-700">
          {readyCount} of {total} documents ready
        </p>
      </div>

      <div className="mt-6">
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-10 space-y-10">
        {byStatus.map((group) => (
          <div key={group.status}>
            <h3 className="text-sm font-semibold text-slate-800">{group.label}</h3>
            <ul className="mt-4 space-y-3">
              {group.items.map(({ key, label, labelRu }) => {
                const st = documents[key];
                const meta = documentUploads[key];
                return (
                  <li
                    key={key}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-900">{label}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{labelRu}</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {st === "READY" && (
                        <>
                          <span
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                            aria-label="Ready"
                            title="Ready"
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
                                Download
                              </button>
                              <button
                                type="button"
                                onClick={() => openPicker(key)}
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={() => void onRemoveFile(key)}
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openPicker(key)}
                              className="rounded-xl border border-dashed border-indigo-300 bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                            >
                              Attach scanned copy
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
                              Saving…
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openPicker(key)}
                              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                            >
                              Upload
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
