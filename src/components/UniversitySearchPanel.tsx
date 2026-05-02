import React, { useEffect, useMemo, useRef, useState } from "react";
import type { UniversityTemplate, UniversityType } from "../mockData";
import { formatTuitionBand } from "../mockData";

export type PriceBand = "all" | "budget" | "mid" | "premium";

const LANDING_FILTERS_KEY = "qapp-landing-filters-v1";
const COMPARE_IDS_KEY = "qapp-landing-compare-v1";
const MAX_COMPARE = 3;

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

const TYPE_IDS = new Set(TYPE_OPTIONS.map((o) => o.id));
const PRICE_IDS = new Set(PRICE_OPTIONS.map((o) => o.id));

type Props = {
  universities: UniversityTemplate[];
  onPickUniversity: (id: string) => void;
};

export function UniversitySearchPanel({ universities, onPickUniversity }: Props) {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<UniversityType | "all">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<PriceBand>("all");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareLimitHint, setCompareLimitHint] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const u of universities) {
      set.add(u.city.split(",")[0].trim());
    }
    return ["all", ...[...set].sort((a, b) => a.localeCompare(b, "ru"))];
  }, [universities]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LANDING_FILTERS_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (typeof p.q === "string") setQ(p.q);
      if (typeof p.typeFilter === "string" && TYPE_IDS.has(p.typeFilter as UniversityType | "all")) {
        setTypeFilter(p.typeFilter as UniversityType | "all");
      }
      if (typeof p.cityFilter === "string") {
        setCityFilter(p.cityFilter === "all" || cityOptions.includes(p.cityFilter) ? p.cityFilter : "all");
      }
      if (typeof p.priceFilter === "string" && PRICE_IDS.has(p.priceFilter as PriceBand)) {
        setPriceFilter(p.priceFilter as PriceBand);
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, [cityOptions]);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        LANDING_FILTERS_KEY,
        JSON.stringify({ q, typeFilter, cityFilter, priceFilter })
      );
    } catch {
      /* quota / private mode */
    }
  }, [q, typeFilter, cityFilter, priceFilter]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(COMPARE_IDS_KEY);
      if (!raw) return;
      const ids = JSON.parse(raw) as unknown;
      if (!Array.isArray(ids)) return;
      const valid = ids
        .filter((id): id is string => typeof id === "string" && universities.some((u) => u.id === id))
        .slice(0, MAX_COMPARE);
      setCompareIds(valid);
    } catch {
      /* ignore */
    }
  }, [universities]);

  useEffect(() => {
    try {
      sessionStorage.setItem(COMPARE_IDS_KEY, JSON.stringify(compareIds));
    } catch {
      /* ignore */
    }
  }, [compareIds]);

  useEffect(() => {
    if (!compareLimitHint) return;
    const t = window.setTimeout(() => setCompareLimitHint(false), 2200);
    return () => window.clearTimeout(t);
  }, [compareLimitHint]);

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

  const compareSet = useMemo(() => new Set(compareIds), [compareIds]);

  const comparedUniversities = useMemo(
    () => compareIds.map((id) => universities.find((u) => u.id === id)).filter(Boolean) as UniversityTemplate[],
    [compareIds, universities]
  );

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) {
        setCompareLimitHint(true);
        return prev;
      }
      return [...prev, id];
    });
  };

  const openCompareDialog = () => {
    if (compareIds.length < 2) return;
    dialogRef.current?.showModal();
  };

  const closeCompareDialog = () => {
    dialogRef.current?.close();
  };

  return (
    <div className={`w-full ${compareIds.length >= 2 ? "pb-24 sm:pb-28" : ""}`}>
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
          autoComplete="off"
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
        <p className="text-xs text-slate-500">
          Запрос и фильтры сохраняются в этой вкладке браузера — при возврате на каталог всё восстановится.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border-2 border-indigo-100 bg-white shadow-xl shadow-indigo-100/40">
        <div className="border-b border-slate-100 bg-indigo-50/50 px-4 py-3 sm:px-6">
          <p className="text-sm font-semibold text-indigo-900">
            Найдено: {filtered.length}{" "}
            <span className="font-normal text-indigo-700">
              — отметьте до {MAX_COMPARE} вузов для сравнения или откройте дашборд
            </span>
          </p>
        </div>
        <ul className="max-h-[min(70vh,520px)] divide-y divide-slate-100 overflow-y-auto">
          {filtered.map((u) => {
            const band = formatTuitionBand(u.tuitionOverview);
            const cityShort = u.city.split(",")[0].trim();
            const langs = u.languagesOfInstruction.slice(0, 3).join(" · ");
            const summary = `${u.type} · осн. ${u.foundedYear} · языки: ${langs} · ${u.programs.length} программ`;
            const checked = compareSet.has(u.id);
            return (
              <li key={u.id} className="flex gap-1 sm:gap-2">
                <div
                  className="flex shrink-0 items-start pt-5 pl-3 sm:pl-4"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCompare(u.id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      aria-label={`Сравнить: ${u.name}`}
                    />
                    <span className="hidden w-14 sm:inline">Сравнить</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => onPickUniversity(u.id)}
                  className="flex min-w-0 flex-1 flex-col gap-2 px-2 py-5 text-left transition hover:bg-indigo-50/80 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:pr-6"
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

      {compareLimitHint && (
        <p className="mt-3 text-center text-sm font-medium text-amber-800" role="status">
          Можно сравнить не более {MAX_COMPARE} вузов — снимите галочку с одного из списка.
        </p>
      )}

      {compareIds.length >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center border-t border-indigo-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(79,70,229,0.12)] backdrop-blur-md">
          <div className="flex w-full max-w-lg flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={openCompareDialog}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
            >
              Сравнить {compareIds.length} вузов
            </button>
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
            >
              Сбросить выбор
            </button>
          </div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="w-[min(100%,920px)] rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/40"
        onClose={closeCompareDialog}
      >
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold">Сравнение вузов</h2>
          <p className="mt-1 text-sm text-slate-600">Ориентиры по контракту и ключевые параметры (данные шаблона MVP).</p>
        </div>
        <div className="max-h-[min(70vh,480px)] overflow-x-auto overflow-y-auto px-3 py-4 sm:px-6">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="sticky left-0 bg-white py-2 pr-3">Параметр</th>
                {comparedUniversities.map((u) => (
                  <th key={u.id} className="min-w-[160px] px-2 py-2 font-semibold text-indigo-900">
                    {u.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <CompareRow label="Город" values={comparedUniversities.map((u) => u.city.split(",")[0].trim())} />
              <CompareRow label="Тип" values={comparedUniversities.map((u) => u.type)} />
              <CompareRow
                label="Контракт (год)"
                values={comparedUniversities.map((u) => formatTuitionBand(u.tuitionOverview))}
              />
              <CompareRow
                label="Программ"
                values={comparedUniversities.map((u) => String(u.programs.length))}
              />
              <CompareRow
                label="Языки"
                values={comparedUniversities.map((u) => u.languagesOfInstruction.join(", "))}
              />
              <CompareRow label="Основан" values={comparedUniversities.map((u) => String(u.foundedYear))} />
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-4 text-right sm:px-6">
          <button
            type="button"
            onClick={closeCompareDialog}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
          >
            Закрыть
          </button>
        </div>
      </dialog>
    </div>
  );
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <th scope="row" className="sticky left-0 bg-white py-3 pr-3 align-top text-sm font-medium text-slate-700">
        {label}
      </th>
      {values.map((v, i) => (
        <td key={i} className="px-2 py-3 align-top text-slate-800">
          {v}
        </td>
      ))}
    </tr>
  );
}
