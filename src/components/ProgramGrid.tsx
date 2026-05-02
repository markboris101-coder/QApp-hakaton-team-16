import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  formatTuitionKzt,
  getFaculty,
  type DegreeLevel,
  type ProgramField,
  type UniversityProgram,
  type UniversityTemplate,
} from "../mockData";

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

function programPriceBand(kzt: number): Exclude<PriceBand, "all"> {
  if (kzt < 4_000_000) return "low";
  if (kzt <= 8_000_000) return "mid";
  return "high";
}

const PRICE_LABELS: Record<Exclude<PriceBand, "all">, string> = {
  low: "до ~4M ₸",
  mid: "~4–8M ₸",
  high: "от ~8M ₸",
};

export function ProgramGrid({ rows, university }: Props) {
  const [fieldFilter, setFieldFilter] = useState<ProgramField | "all">("all");
  const [degreeFilter, setDegreeFilter] = useState<DegreeLevel | "all">("all");
  const [facultyFilter, setFacultyFilter] = useState<string | "all">("all");
  const [languageFilter, setLanguageFilter] = useState<string | "all">("all");
  const [priceBand, setPriceBand] = useState<PriceBand>("all");
  const [query, setQuery] = useState("");

  const languageOptions = useMemo(() => {
    const s = new Set(rows.map((r) => r.program.language));
    return ["all" as const, ...[...s].sort((a, b) => a.localeCompare(b, "ru"))];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(({ program }) => {
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
  }, [rows, fieldFilter, degreeFilter, facultyFilter, languageFilter, priceBand, query]);

  return (
    <section id="program-grid">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Сетка программ</h2>
          <p className="mt-1 text-sm text-slate-600">
            Фильтры по факультету, языку и цене — в дополнение к направлению и степени. Карточки показывают актуальный AI
            fit.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[240px]">
          <label className="sr-only" htmlFor="program-search">
            Поиск программ
          </label>
          <input
            id="program-search"
            type="search"
            placeholder="Поиск по названию программы…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Направление</span>
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
              {f === "all" ? "Все" : f}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Степень</span>
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
              {d === "all" ? "Все" : d}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Факультет</span>
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value as typeof facultyFilter)}
            className="max-w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:max-w-xs"
          >
            <option value="all">Все факультеты</option>
            {university.faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Язык программы</span>
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
                {lang === "all" ? "Все языки" : lang}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Цена (год)</span>
          <button
            type="button"
            onClick={() => setPriceBand("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              priceBand === "all"
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200/80"
            }`}
          >
            Любая
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
              {PRICE_LABELS[b]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
          Нет программ по этим фильтрам. Сбросьте часть условий или очистите поиск.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map(({ program, score, englishWarning }) => {
            const fac = getFaculty(university, program.facultyId);
            return (
              <li key={program.id}>
                <Link
                  to={`/program/${program.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">{program.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {fac?.name ?? program.facultyId} · {program.field} · {program.degree} · {program.durationYears}{" "}
                        лет · {program.language}
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
                  <p className="mt-3 text-xs font-medium text-indigo-600">Подробнее →</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
