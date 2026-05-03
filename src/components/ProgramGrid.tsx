import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  formatTuitionKzt,
  getFaculty,
  type DegreeLevel,
  type ProgramField,
  type UniversityProgram,
  type UniversityTemplate,
} from "../mockData";
import { getFacultyDisplayName } from "../lib/universityLabels";
import { useProfile } from "../context/ProfileContext";

export type ProgramRow = {
  program: UniversityProgram;
  score: number;
  englishWarning?: string;
};

type Props = {
  rows: ProgramRow[];
  university: UniversityTemplate;
};

const FIELDS: Array<ProgramField | "all"> = [
  "all",
  "Engineering",
  "Business",
  "Science",
  "Law",
  "Humanities",
  "Social Sciences",
  "Medicine",
];

const DEGREES: Array<DegreeLevel | "all"> = ["all", "Bachelor", "Master", "PhD"];

type PriceBand = "all" | "low" | "mid" | "high";

/** Фильтр Fit Score по §10.D ТЗ */
type FitBand = "all" | "high" | "mid" | "low";

function fitBand(score: number): Exclude<FitBand, "all"> {
  if (score >= 75) return "high";
  if (score >= 55) return "mid";
  return "low";
}

function programPriceBand(kzt: number): Exclude<PriceBand, "all"> {
  if (kzt < 4_000_000) return "low";
  if (kzt <= 8_000_000) return "mid";
  return "high";
}

export function ProgramGrid({ rows, university }: Props) {
  const { t, i18n } = useTranslation();
  const { shortlist, toggleShortlist, isShortlisted } = useProfile();
  const [fieldFilter, setFieldFilter] = useState<ProgramField | "all">("all");
  const [degreeFilter, setDegreeFilter] = useState<DegreeLevel | "all">("all");
  const [facultyFilter, setFacultyFilter] = useState<string | "all">("all");
  const [languageFilter, setLanguageFilter] = useState<string | "all">("all");
  const [priceBand, setPriceBand] = useState<PriceBand>("all");
  const [fitBandFilter, setFitBandFilter] = useState<FitBand>("all");
  const [query, setQuery] = useState("");

  const sortedRows = useMemo(() => [...rows].sort((a, b) => b.score - a.score), [rows]);

  const languageOptions = useMemo(() => {
    const s = new Set(sortedRows.map((r) => r.program.language));
    const loc = i18n.language.startsWith("kk") ? "kk" : i18n.language.startsWith("ru") ? "ru" : "en";
    return ["all" as const, ...[...s].sort((a, b) => a.localeCompare(b, loc))];
  }, [sortedRows, i18n.language]);

  const priceLabels = useMemo(
    (): Record<Exclude<PriceBand, "all">, string> => ({
      low: t("programGrid.priceLow"),
      mid: t("programGrid.priceMid"),
      high: t("programGrid.priceHigh"),
    }),
    [t, i18n.language]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedRows.filter(({ program, score }) => {
      if (fitBandFilter !== "all" && fitBand(score) !== fitBandFilter) return false;
      if (fieldFilter !== "all" && program.field !== fieldFilter) return false;
      if (degreeFilter !== "all" && program.degree !== degreeFilter) return false;
      if (facultyFilter !== "all" && program.facultyId !== facultyFilter) return false;
      if (languageFilter !== "all" && program.language !== languageFilter) return false;
      if (priceBand !== "all" && programPriceBand(program.annualTuitionKzt) !== priceBand) return false;
      if (
        q &&
        !program.name.toLowerCase().includes(q) &&
        !program.id.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [sortedRows, fitBandFilter, fieldFilter, degreeFilter, facultyFilter, languageFilter, priceBand, query]);

  return (
    <section id="program-grid">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t("programGrid.title")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("programGrid.subtitle")}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[240px]">
          <label className="sr-only" htmlFor="program-search">
            {t("programGrid.searchLabel")}
          </label>
          <input
            id="program-search"
            type="search"
            placeholder={t("programGrid.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("programGrid.fitLabel")}</span>
          {(["all", "high", "mid", "low"] as const).map((fb) => (
            <button
              key={fb}
              type="button"
              onClick={() => setFitBandFilter(fb)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                fitBandFilter === fb
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200/80"
              }`}
            >
              {fb === "all"
                ? t("programGrid.fitAll")
                : fb === "high"
                  ? t("programGrid.fitHigh")
                  : fb === "mid"
                    ? t("programGrid.fitMid")
                    : t("programGrid.fitLow")}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("programGrid.fieldLabel")}</span>
          {FIELDS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFieldFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                fieldFilter === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200/80"
              }`}
            >
              {f === "all" ? t("programGrid.all") : f}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("programGrid.degreeLabel")}</span>
          {DEGREES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDegreeFilter(d)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                degreeFilter === d
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200/80"
              }`}
            >
              {d === "all" ? t("programGrid.all") : d}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("programGrid.facultyLabel")}</span>
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value as typeof facultyFilter)}
            className="max-w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:max-w-xs"
          >
            <option value="all">{t("programGrid.allFaculties")}</option>
            {university.faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {getFacultyDisplayName(f, i18n.language)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("programGrid.languageLabel")}</span>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguageFilter(lang)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  languageFilter === lang
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200/80"
                }`}
              >
                {lang === "all" ? t("programGrid.allLanguages") : lang}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("programGrid.priceLabel")}</span>
          <button
            type="button"
            onClick={() => setPriceBand("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              priceBand === "all"
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200/80"
            }`}
          >
            {t("programGrid.anyPrice")}
          </button>
          {(["low", "mid", "high"] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setPriceBand(b)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                priceBand === b
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200/80"
              }`}
            >
              {priceLabels[b]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
          {t("programGrid.emptyState")}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map(({ program, score, englishWarning }) => {
            const fac = getFaculty(university, program.facultyId);
            const yearsLabel = t("programMeta.years", { count: program.durationYears });
            const listed = isShortlisted(program.id);
            return (
              <li key={program.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
                <Link
                  to={`/program/${program.id}`}
                  className="block p-5 pb-3 transition-colors hover:bg-slate-50/80 active:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">{program.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {fac ? getFacultyDisplayName(fac, i18n.language) : program.facultyId} · {program.field} ·{" "}
                        {program.degree} · {yearsLabel} · {program.language}
                      </p>
                      <p className="mt-1 text-xs font-medium text-emerald-900 tabular-nums">
                        {formatTuitionKzt(program.annualTuitionKzt)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white tabular-nums">
                      {score}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{program.matchReason}</p>
                  {englishWarning && (
                    <p className="mt-2 text-sm font-medium text-amber-800">{englishWarning}</p>
                  )}
                </Link>
                <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                  <Link
                    to={`/program/${program.id}`}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:flex-none sm:px-4 sm:text-sm"
                  >
                    {t("programGrid.viewRequirements")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleShortlist(program.id)}
                    className={`inline-flex flex-1 items-center justify-center rounded-xl border px-3 py-2 text-center text-xs font-semibold transition sm:flex-none sm:px-4 sm:text-sm ${
                      listed
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {listed ? t("programGrid.removeShortlist") : t("programGrid.addShortlist")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
