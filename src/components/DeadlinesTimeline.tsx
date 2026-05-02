import React, { useMemo } from "react";
import type { StudentDocuments } from "../mockData";

type Props = {
  applicationDeadlineIso: string;
  documents: StudentDocuments;
};

function formatLongDate(iso: string): string {
  const d = new Date(iso + (iso.includes("T") ? "" : "T12:00:00"));
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function daysUntilDeadline(iso: string): number {
  const end = new Date(iso + (iso.includes("T") ? "" : "T23:59:59"));
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function DeadlinesTimeline({ applicationDeadlineIso, documents }: Props) {
  const daysLeft = useMemo(() => daysUntilDeadline(applicationDeadlineIso), [applicationDeadlineIso]);
  /** ТЗ: критичный варнинг — при отсутствии загруженной медсправки 075/у (не READY). */
  const medicalActionNeeded = documents.medicalCertificate !== "READY";

  const todayLabel = new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">10.E</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-900">Deadlines timeline</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
        Your path from today to the final application deadline — stay ahead of each milestone.
      </p>

      {medicalActionNeeded && (
        <div
          className="mt-6 rounded-2xl border border-red-300/90 bg-red-50 px-4 py-3.5 text-sm leading-relaxed text-red-950 shadow-sm ring-1 ring-red-200/70"
          role="alert"
        >
          <span className="font-semibold">Action Needed: </span>
          Upload your Medical Certificate (форма 075/у) before the admission deadline. This document is required for
          your checklist to clear the medical step.
        </div>
      )}

      <div className="relative mt-8 pl-2">
        <div className="absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-indigo-200 via-slate-200 to-violet-200" aria-hidden />

        <ol className="space-y-10">
          <li className="relative flex gap-4">
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-md ring-4 ring-white">
              1
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">Today</p>
              <p className="mt-1 text-sm text-slate-600">{todayLabel} — you are here.</p>
            </div>
          </li>

          <li className="relative flex gap-4">
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm ring-4 ring-white">
              2
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">Upload documents</p>
              <p className="mt-1 text-sm text-slate-600">
                Use the admission checklist: ID / Passport, Photo 3×4, Academic Transcript, Diploma / Certificate, and
                Medical Certificate (075/у).
              </p>
            </div>
          </li>

          <li className="relative flex gap-4">
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white shadow-md ring-4 ring-white">
              3
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">Final deadline</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{formatLongDate(applicationDeadlineIso)}</p>
              <p className="mt-2 text-sm text-slate-600">
                {daysLeft > 0 ? (
                  <>
                    <span className="font-semibold tabular-nums text-indigo-700">{daysLeft}</span>
                    {daysLeft === 1 ? " day" : " days"} left until admissions close.
                  </>
                ) : daysLeft === 0 ? (
                  <span className="font-medium text-amber-800">Deadline is today — submit if you have not yet.</span>
                ) : (
                  <span className="font-medium text-slate-700">This deadline has passed — contact admissions for late options.</span>
                )}
              </p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
