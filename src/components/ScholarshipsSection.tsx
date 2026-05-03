import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type {
  FinancialSituation,
  ScholarshipAiRelevance,
  ScholarshipInfo,
  StudentProfile,
} from "../mockData";
import { useProfile } from "../context/ProfileContext";
import { useSmartAdvisor } from "../hooks/useSmartAdvisor";
import { TextSkeleton } from "./TextSkeleton";
import { isAiConfigured } from "../services/aiProvider";

type FilterRel = "all" | ScholarshipAiRelevance;

type SchCheckId =
  | "gpaThreshold"
  | "ielts656"
  | "needBasedFin"
  | "meritOlympiad"
  | "meritAcademic";

function tFinancial(t: (key: string) => string, fin: FinancialSituation): string {
  if (fin === "Need Full Scholarship") return t("financial.needFull");
  if (fin === "Partial Scholarship") return t("financial.partial");
  return t("financial.selfFunded");
}

function estimateScholarshipAlignment(
  student: StudentProfile,
  s: ScholarshipInfo
): { score: number; checks: { id: SchCheckId; ok: boolean }[] } {
  const gpa = student.academic.gpa;
  const ielts = student.academic.ielts;
  const fin = student.preferences.financialStatus;
  const needBased = /need|financial|aid/i.test(s.name) || /need|financial/i.test(s.requirements);
  const merit = /merit|scholarship|olympiad|science|nu scholarship/i.test(s.name);
  const hasOlympiad = student.awards.some((a) => /olympiad/i.test(a));
  const olympiadOk = student.olympiadVerified === true;

  const checks: { id: SchCheckId; ok: boolean }[] = [];

  checks.push({
    id: "gpaThreshold",
    ok: gpa >= 4.0,
  });
  checks.push({
    id: "ielts656",
    ok: ielts >= 6.5,
  });
  if (needBased) {
    checks.push({
      id: "needBasedFin",
      ok: fin === "Need Full Scholarship" || fin === "Partial Scholarship",
    });
  }
  if (merit && /STEM|science|olympiad/i.test(s.requirements)) {
    checks.push({
      id: "meritOlympiad",
      ok: !hasOlympiad || olympiadOk,
    });
  } else if (merit) {
    const sat = student.academic.sat;
    const unt = student.academic.untScore;
    const strongMerit = gpa >= 4.2 && (sat <= 0 ? unt >= 100 : sat >= 1280);
    checks.push({
      id: "meritAcademic",
      ok: strongMerit,
    });
  }

  const passed = checks.filter((c) => c.ok).length;
  const ratio = passed / checks.length;
  let base = 35 + ratio * 55;
  if (s.aiRelevance === "High") base += 4;
  if (s.aiRelevance === "Low") base -= 6;
  return { score: Math.min(100, Math.max(12, Math.round(base))), checks };
}

const REL_CLASS: Record<ScholarshipAiRelevance, string> = {
  High: "bg-amber-100 text-amber-950 ring-amber-200",
  Medium: "bg-slate-100 text-slate-800 ring-slate-200",
  Low: "bg-slate-50 text-slate-600 ring-slate-200",
};

function relLabelKey(rel: ScholarshipAiRelevance): "relHigh" | "relMed" | "relLow" {
  if (rel === "High") return "relHigh";
  if (rel === "Medium") return "relMed";
  return "relLow";
}

function ScholarshipAiPanel({ scholarship }: { scholarship: ScholarshipInfo }) {
  const { t } = useTranslation();
  const { getScholarshipAdvice } = useSmartAdvisor();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    if (!isAiConfigured()) {
      setText(t("scholarships.aiNoKey"));
      setLoading(false);
      setFetched(true);
      return;
    }
    try {
      const advice = await getScholarshipAdvice(scholarship.name);
      setText(advice);
      setFetched(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("scholarships.aiError"));
      setFetched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t border-slate-200/80 pt-4">
      <p className="text-sm font-semibold text-indigo-800">{t("scholarships.aiTitle")}</p>
      <p className="mt-1 text-xs text-slate-600">{t("scholarships.aiHint")}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {fetched ? t("scholarships.aiRefresh") : t("scholarships.aiRequest")}
        </button>
      </div>
      <div className="mt-3 rounded-xl bg-indigo-50/50 px-3 py-2.5 ring-1 ring-indigo-100/80">
        {loading ? (
          <TextSkeleton lines={3} />
        ) : err ? (
          <p className="text-sm text-red-600">{err}</p>
        ) : fetched ? (
          <p className="text-sm leading-relaxed text-slate-800">{text}</p>
        ) : (
          <p className="text-sm text-slate-600">{t("scholarships.aiPlaceholder")}</p>
        )}
      </div>
    </div>
  );
}

export function ScholarshipsSection() {
  const { t } = useTranslation();
  const { universityData, student } = useProfile();
  const scholarships = universityData.scholarships;
  const [filter, setFilter] = useState<FilterRel>("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(() => {
    return scholarships
      .filter((s) => (filter === "all" ? true : s.aiRelevance === filter))
      .filter((s) => {
        const query = q.trim().toLowerCase();
        if (!query) return true;
        return s.name.toLowerCase().includes(query) || s.requirements.toLowerCase().includes(query);
      })
      .map((s) => ({
        s,
        est: estimateScholarshipAlignment(student, s),
      }))
      .sort((a, b) => b.est.score - a.est.score);
  }, [scholarships, filter, q, student]);

  const finDisplay = tFinancial(t, student.preferences.financialStatus);

  return (
    <section className="w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 shadow-sm">
      <div className="border-b border-slate-200/80 bg-white/80 px-6 py-6 sm:px-8 sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{t("scholarships.kicker")}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t("scholarships.title")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{t("scholarships.intro")}</p>
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["all", "High", "Medium", "Low"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === k
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80 hover:bg-slate-200/80"
                }`}
              >
                {k === "all"
                  ? t("scholarships.filterAll")
                  : k === "High"
                    ? t("scholarships.filterHigh")
                    : k === "Medium"
                      ? t("scholarships.filterMedium")
                      : t("scholarships.filterLow")}
              </button>
            ))}
          </div>
          <div className="flex w-full max-w-md flex-col gap-1">
            <label className="text-xs font-medium text-slate-500" htmlFor="sch-search">
              {t("scholarships.searchLabel")}
            </label>
            <input
              id="sch-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("scholarships.searchPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-indigo-200/80 bg-indigo-50/30 px-4 py-3 text-sm text-slate-700">
          <span>
            {t("scholarships.profileLine", {
              gpa: student.academic.gpa.toFixed(1),
              ielts: student.academic.ielts.toFixed(1),
              fin: finDisplay,
            })}
            {student.olympiadVerified && (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">
                {t("scholarships.olympiadVerified")}
              </span>
            )}
          </span>
          <Link to="/profile" className="font-medium text-indigo-600 hover:text-indigo-800">
            {t("scholarships.editProfile")}
          </Link>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <ul className="space-y-4">
          {rows.map(({ s, est }) => {
            const relKey = relLabelKey(s.aiRelevance);
            const isOpen = expanded === s.name;
            return (
              <li
                key={s.name}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-stretch lg:gap-6">
                  <div className="min-w-0 flex-1 lg:grid lg:grid-cols-[1fr_120px] lg:gap-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">{s.name}</h3>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${REL_CLASS[s.aiRelevance]}`}
                        >
                          {t(`scholarships.${relKey}`)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.requirements}</p>
                      <div className="mt-3">
                        <Link
                          to="/profile"
                          className="inline-flex rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-800 shadow-sm transition hover:bg-indigo-50"
                        >
                          {t("scholarships.ctaPrepare")}
                        </Link>
                      </div>
                    </div>
                    <div className="flex flex-col items-stretch justify-center border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {t("scholarships.matchLabel")}
                      </p>
                      <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{est.score}%</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          style={{ width: `${est.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("scholarships.quickChecklist")}
                  </p>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {est.checks.map((c) => (
                      <li
                        key={`${s.name}-${c.id}`}
                        className={`flex items-start gap-2 text-sm ${c.ok ? "text-emerald-800" : "text-amber-900"}`}
                      >
                        <span className="mt-0.5 select-none" aria-hidden>
                          {c.ok ? "✓" : "○"}
                        </span>
                        <span>{t(`scholarships.check.${c.id}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : s.name)}
                    className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {isOpen ? t("scholarships.collapse") : t("scholarships.expandAi")}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <ScholarshipAiPanel scholarship={s} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </li>
            );
          })}
        </ul>
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">{t("scholarships.empty")}</p>
        )}
      </div>
    </section>
  );
}
