import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { StudentProfile, UniversityTemplate } from "../mockData";
import { formatSatForDisplay } from "../lib/academicInput";
import { getFitMatchTier } from "../lib/fitMatchTier";
import { getUniversityDisplayName } from "../lib/universityLabels";
import { resolveUniversityExternalWebsite } from "../lib/universityWebsite";
import { DOCUMENT_ENTRIES } from "./documentLabels";
import { useProfile } from "../context/ProfileContext";

function formatDeadlineShort(iso: string, locale: string): string {
  const d = new Date(iso + (iso.includes("T") ? "" : "T12:00:00"));
  const loc = locale.startsWith("kk") ? "kk-KZ" : locale.startsWith("ru") ? "ru-RU" : "en-US";
  return d.toLocaleDateString(loc, { month: "short", day: "numeric", year: "numeric" });
}

type Props = {
  university: UniversityTemplate;
  averageFitPercent: number;
  student: StudentProfile;
};

export function DashboardStickySidebar({ university, averageFitPercent, student }: Props) {
  const { t, i18n } = useTranslation();
  const { shortlist } = useProfile();
  const a = student.academic;
  const uniName = getUniversityDisplayName(university, i18n.language);
  const externalSite = resolveUniversityExternalWebsite(university);
  const tier = getFitMatchTier(averageFitPercent);
  const langs = university.languagesOfInstruction.join(" · ");

  const pendingActions = useMemo(() => {
    let n = 0;
    for (const e of DOCUMENT_ENTRIES) {
      if (student.documents[e.key] === "MISSING" || student.documents[e.key] === "PENDING") n++;
    }
    if (shortlist.length === 0) n++;
    return n;
  }, [student.documents, shortlist.length]);

  const profileReady =
    Boolean(student.preferences.city?.trim()) && student.preferences.interests.length > 0;
  const docsReady = DOCUMENT_ENTRIES.every((e) => student.documents[e.key] === "READY");
  const steps = [
    { ok: profileReady, label: t("sidebar.stepProfile") },
    { ok: docsReady, label: t("sidebar.stepDocs") },
    { ok: shortlist.length > 0, label: t("sidebar.stepPrograms") },
    { ok: docsReady && shortlist.length > 0, label: t("sidebar.stepSubmit") },
  ];

  return (
    <aside className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("sidebar.currentUni")}</p>
        <p className="mt-1 text-sm font-semibold leading-snug text-slate-900">{uniName}</p>
        <p className="text-xs text-slate-600">{university.city}</p>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4 ring-1 ring-indigo-100">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("sidebar.avgFit")}</p>
        <p className="mt-1 text-center text-2xl font-bold tabular-nums text-slate-900">{averageFitPercent}%</p>
        <p className="mt-1 text-center text-xs font-semibold text-indigo-800">{t(`aiFit.tier.${tier}`)}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            style={{ width: `${Math.min(100, Math.max(0, averageFitPercent))}%` }}
          />
        </div>
        <div className="mt-4 border-t border-indigo-100/80 pt-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">{t("sidebar.status")}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{t(`aiFit.tier.${tier}`)}</p>
          <p className="mt-2 text-xs text-slate-600">
            {t("sidebar.pendingActions")}: {t("sidebar.pendingCount", { count: pendingActions })}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("sidebar.miniChecklist")}</p>
        <ul className="mt-2 space-y-2">
          {steps.map((s) => (
            <li key={s.label} className="flex items-start gap-2 text-sm">
              <span className={s.ok ? "text-emerald-600" : "text-slate-300"} aria-hidden>
                {s.ok ? "☑" : "☐"}
              </span>
              <span className={s.ok ? "text-slate-800" : "text-slate-500"}>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <dl className="space-y-2 border-t border-slate-100 pt-4 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("sidebar.quickInfo")}</p>
        <div className="flex justify-between gap-2 pt-1">
          <dt className="text-slate-500">{t("sidebar.languages")}</dt>
          <dd className="max-w-[60%] text-right font-medium text-slate-900">{langs}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">{t("sidebar.deadline")}</dt>
          <dd className="font-medium tabular-nums text-amber-900">
            {formatDeadlineShort(university.applicationDeadline, i18n.language)}
          </dd>
        </div>
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
          <span className="font-medium text-slate-700">{t("sidebar.programsInGrid")}</span> {university.programs.length}
        </div>
      </dl>

      {(externalSite || university.admissionsEmail) && (
        <div className="border-t border-slate-100 pt-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("sidebar.contact")}</p>
          {externalSite && (
            <a
              href={externalSite}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block truncate font-medium text-indigo-600 hover:text-indigo-800"
            >
              {t("sidebar.officialSite")}
            </a>
          )}
          {university.admissionsEmail && (
            <a href={`mailto:${university.admissionsEmail}`} className="mt-1 block truncate text-slate-700 hover:text-indigo-700">
              {university.admissionsEmail}
            </a>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
        <Link
          to="/dashboard#admission-checklist"
          className="rounded-xl bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          {t("sidebar.ctaStart")}
        </Link>
        <Link
          to="/dashboard#ai-fit-card"
          className="rounded-xl border border-indigo-200 bg-indigo-50 py-2 text-center text-sm font-semibold text-indigo-900 hover:bg-indigo-100"
        >
          {t("sidebar.ctaAi")}
        </Link>
        <Link to="/profile" className="rounded-xl border border-slate-200 bg-white py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-50">
          {t("nav.profile")}
        </Link>
      </div>
    </aside>
  );
}
