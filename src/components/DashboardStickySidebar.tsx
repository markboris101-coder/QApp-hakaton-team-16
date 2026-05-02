import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { StudentProfile } from "../mockData";
import { formatSatForDisplay } from "../lib/academicInput";

type Props = {
  universityName: string;
  city: string;
  averageFitPercent: number;
  programCount: number;
  student: StudentProfile;
};

export function DashboardStickySidebar({
  universityName,
  city,
  averageFitPercent,
  programCount,
  student,
}: Props) {
  const { t } = useTranslation();
  const a = student.academic;
  return (
    <aside className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("sidebar.currentUni")}</p>
        <p className="mt-1 text-sm font-semibold leading-snug text-slate-900">{universityName}</p>
        <p className="text-xs text-slate-600">{city}</p>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4 ring-1 ring-indigo-100">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("sidebar.avgFit")}</p>
        <p className="mt-1 text-center text-4xl font-bold tabular-nums text-slate-900">{averageFitPercent}%</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            style={{ width: `${Math.min(100, Math.max(0, averageFitPercent))}%` }}
          />
        </div>
      </div>

      <dl className="space-y-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">GPA</dt>
          <dd className="font-medium tabular-nums text-slate-900">{a.gpa.toFixed(1)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">{t("sidebar.satUnt")}</dt>
          <dd className="font-medium tabular-nums text-slate-900">
            {formatSatForDisplay(a.sat)} · {a.untScore}/140
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">IELTS</dt>
          <dd className="font-medium tabular-nums text-slate-900">{a.ielts.toFixed(1)}</dd>
        </div>
        <div className="pt-1 text-xs text-slate-600">
          <span className="font-medium text-slate-700">{t("sidebar.programsInGrid")}</span> {programCount}
        </div>
      </dl>

      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
        <Link
          to="/profile"
          className="rounded-xl bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          {t("nav.profile")}
        </Link>
        <a
          href="/dashboard#program-grid"
          className="rounded-xl border border-slate-200 bg-slate-50 py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-100"
        >
          {t("nav.programs")}
        </a>
        <a
          href="/dashboard#admission-checklist"
          className="rounded-xl border border-slate-200 bg-white py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          {t("nav.checklist")}
        </a>
        <a href="/dashboard#ai-fit-card" className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
          {t("sidebar.aiFitLink")}
        </a>
      </div>
    </aside>
  );
}
