import React, { useMemo, useState } from "react";
import type { UniversityTemplate, UniversityType } from "../mockData";
import { formatTuitionBand } from "../mockData";

export type PriceBand = "all" | "budget" | "mid" | "premium";

function bandForUniversity(u: UniversityTemplate): Exclude<PriceBand, "all"> {
  const m = u.tuitionOverview.maxKzt;
  if (m <= 3_500_000) return "budget";
  if (m <= 8_000_000) return "mid";
  return "premium";
}

const TYPE_OPTIONS: Array<{ id: UniversityType | "all"; label: string }> = [
  { id: "all", label: "Все типы" },
  { id: "Research", label: "Research" },
  { id: "Technical", label: "Technical" },
  { id: "Comprehensive", label: "Comprehensive" },
  { id: "Liberal Arts", label: "Liberal Arts" },
];

const PRICE_OPTIONS: Array<{ id: PriceBand; label: string; hint: string }> = [
  { id: "all", label: "Любая цена", hint: "" },
  { id: "budget", label: "До ~3.5M ₸", hint: "бюджетный сегмент" },
  { id: "mid", label: "~3.5–8M ₸", hint: "средний" },
  { id: "premium", label: "От ~8M ₸", hint: "премиум" },
];

type Props = {
  universities: UniversityTemplate[];
  onPickUniversity: (id: string) => void;
};

export function UniversitySearchPanel({ universities, onPickUniversity }: Props) {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<UniversityType | "all">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<PriceBand>("all");

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const u of universities) {
      set.add(u.city.split(",")[0].trim());
    }
    return ["all", ...[...set].sort((a, b) => a.localeCompare(b, "ru"))];
  }, [universities]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return universities.filter((u) => {
      if (typeFilter !== "all" && u.type !== typeFilter) return false;
      if (cityFilter !== "all" && !u.city.toLowerCase().startsWith(cityFilter.toLowerCase())) return false;
      if (priceFilter !== "all" && bandForUniversity(u) !== priceFilter) return false;
      if (!t) return true;
      const blob = [
        u.name,
        u.city,
        u.type,
        u.scholarshipBlurb,
        u.languagesOfInstruction.join(" "),
        String(u.foundedYear),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(t);
    });
  }, [universities, q, typeFilter, cityFilter, priceFilter]);

  return (
    <div className="w-full">
      <div className="relative">
        <label className="sr-only" htmlFor="landing-uni-search">
          Поиск университетов Казахстана
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
          <span className="text-xl text-indigo-500" aria-hidden>
            ⌕
          </span>
        </div>
        <input
          id="landing-uni-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Название вуза, город, язык обучения…"
          className="w-full rounded-2xl border-2 border-indigo-200 bg-white py-5 pl-14 pr-6 text-lg text-slate-900 shadow-lg shadow-indigo-100/80 ring-4 ring-indigo-100/60 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200/90 sm:text-xl"
        />
      </div>

      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Фильтры</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="min-w-0 flex-1">
            <span className="mb-2 block text-xs font-medium text-slate-600">Тип вуза</span>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTypeFilter(opt.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    typeFilter === opt.id
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-[200px]">
            <label className="mb-2 block text-xs font-medium text-slate-600" htmlFor="filter-city">
              Город
            </label>
            <select
              id="filter-city"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "Все города" : c}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[220px] flex-1">
            <span className="mb-2 block text-xs font-medium text-slate-600">Стоимость (ориентир / год)</span>
            <div className="flex flex-wrap gap-2">
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  title={opt.hint}
                  onClick={() => setPriceFilter(opt.id)}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                    priceFilter === opt.id
                      ? "bg-emerald-700 text-white shadow-md"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border-2 border-indigo-100 bg-white shadow-xl shadow-indigo-100/40">
          <div className="border-b border-slate-100 bg-indigo-50/50 px-4 py-3 sm:px-6">
            <p className="text-sm font-semibold text-indigo-900">
              Найдено: {filtered.length}{" "}
              <span className="font-normal text-indigo-700">— выберите вуз, чтобы открыть дашборд</span>
            </p>
          </div>
          <ul className="max-h-[min(70vh,520px)] divide-y divide-slate-100 overflow-y-auto">
            {filtered.map((u) => {
              const band = formatTuitionBand(u.tuitionOverview);
              const cityShort = u.city.split(",")[0].trim();
              const langs = u.languagesOfInstruction.slice(0, 3).join(" · ");
              const summary = `${u.type} · осн. ${u.foundedYear} · языки: ${langs} · ${u.programs.length} программ`;
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => onPickUniversity(u.id)}
                    className="flex w-full flex-col gap-2 px-4 py-5 text-left transition hover:bg-indigo-50/80 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-lg font-semibold leading-snug text-slate-900">{u.name}</span>
                      <p className="mt-1 text-sm text-slate-500">{cityShort}</p>
                      <p className="mt-1 text-sm font-medium text-emerald-800">{band}</p>
                      <p className="mt-2 text-sm text-slate-600">{summary}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{u.scholarshipBlurb}</p>
                    </div>
                    <span className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm sm:self-center">
                      Открыть →
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 && (
            <p className="px-6 py-12 text-center text-slate-600">Ничего не подошло — сбросьте фильтры или запрос.</p>
          )}
        </div>
    </div>
  );
}
