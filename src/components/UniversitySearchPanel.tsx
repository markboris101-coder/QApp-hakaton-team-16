import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { UniversityTemplate, UniversityType } from "../mockData";
import { formatTuitionBand } from "../mockData";
import {
  buildRichCompareClipboardText,
  buildUniversitySnapshot,
  COMPARE_SECTION_ORDER,
  COMPARE_TABLE_ROWS,
  type UniversityCompareSnapshot,
} from "../lib/universityCompareFacts";
import { useProfile } from "../context/ProfileContext";
import { getUniversityDisplayName, universitySearchBlob } from "../lib/universityLabels";

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

const TYPE_IDS = new Set<string>(["all", "Research", "Technical", "Comprehensive", "Liberal Arts"]);
const PRICE_IDS = new Set<string>(["all", "budget", "mid", "premium"]);

type Props = {
  universities: UniversityTemplate[];
  onPickUniversity: (id: string) => void;
  /** Вуз с лучшим матчем по профилю — показывает бейдж в списке */
  recommendedUniversityId?: string;
};

export function UniversitySearchPanel({
  universities,
  onPickUniversity,
  recommendedUniversityId,
}: Props) {
  const { t, i18n } = useTranslation();
  const { isFavoriteUniversity, toggleFavoriteUniversity } = useProfile();

  const typeOptions: Array<{ id: UniversityType | "all"; label: string }> = useMemo(
    () => [
      { id: "all", label: t("search.type.all") },
      { id: "Research", label: t("search.type.Research") },
      { id: "Technical", label: t("search.type.Technical") },
      { id: "Comprehensive", label: t("search.type.Comprehensive") },
      { id: "Liberal Arts", label: t("search.type.Liberal Arts") },
    ],
    [t]
  );

  const priceOptions: Array<{ id: PriceBand; label: string; hint: string }> = useMemo(
    () => [
      { id: "all", label: t("search.price.all"), hint: "" },
      { id: "budget", label: t("search.price.budget"), hint: t("search.priceHint.budget") },
      { id: "mid", label: t("search.price.mid"), hint: t("search.priceHint.mid") },
      { id: "premium", label: t("search.price.premium"), hint: t("search.priceHint.premium") },
    ],
    [t]
  );
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<UniversityType | "all">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<PriceBand>("all");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareLimitHint, setCompareLimitHint] = useState(false);
  const [compareDetailLevel, setCompareDetailLevel] = useState<"full" | "compact">("full");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const compareTriggerRef = useRef<HTMLButtonElement>(null);
  const dialogTitleRef = useRef<HTMLHeadingElement>(null);

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
      const blob = universitySearchBlob(u).toLowerCase();
      return blob.includes(t);
    });
  }, [universities, q, typeFilter, cityFilter, priceFilter]);

  const compareSet = useMemo(() => new Set(compareIds), [compareIds]);

  const comparedUniversities = useMemo(
    () => compareIds.map((id) => universities.find((u) => u.id === id)).filter(Boolean) as UniversityTemplate[],
    [compareIds, universities]
  );

  const snapshotById = useMemo(() => {
    const m = new Map<string, UniversityCompareSnapshot>();
    for (const u of comparedUniversities) m.set(u.id, buildUniversitySnapshot(u));
    return m;
  }, [comparedUniversities]);

  const compareRowsVisible = useMemo(
    () => COMPARE_TABLE_ROWS.filter((r) => compareDetailLevel === "full" || !r.detail),
    [compareDetailLevel]
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
    queueMicrotask(() => dialogTitleRef.current?.focus());
  };

  const closeCompareDialog = () => {
    dialogRef.current?.close();
  };

  const handleCompareDialogClose = () => {
    compareTriggerRef.current?.focus();
  };

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onBackdrop = (e: MouseEvent) => {
      if (e.target === el) el.close();
    };
    el.addEventListener("click", onBackdrop);
    return () => el.removeEventListener("click", onBackdrop);
  }, []);

  const [copyDone, setCopyDone] = useState(false);
  useEffect(() => {
    if (!copyDone) return;
    const t = window.setTimeout(() => setCopyDone(false), 2000);
    return () => window.clearTimeout(t);
  }, [copyDone]);

  const handleCopyCompare = async () => {
    const text = buildRichCompareClipboardText(comparedUniversities);
    try {
      await navigator.clipboard.writeText(text);
      setCopyDone(true);
    } catch {
      window.alert(t("search.copyFail"));
    }
  };

  return (
    <div className={`w-full ${compareIds.length >= 2 ? "pb-24 sm:pb-28" : ""}`}>
      <div className="relative">
        <label className="sr-only" htmlFor="landing-uni-search">
          {t("search.searchLabel")}
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
          placeholder={t("search.placeholder")}
          autoComplete="off"
          className="w-full rounded-2xl border-2 border-indigo-200 bg-white py-5 pl-14 pr-6 text-lg text-slate-900 shadow-lg shadow-indigo-100/80 ring-4 ring-indigo-100/60 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200/90 sm:text-xl"
        />
      </div>

      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("search.filters")}</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="min-w-0 flex-1">
            <span className="mb-2 block text-xs font-medium text-slate-600">{t("search.typeLabel")}</span>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((opt) => (
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
              {t("search.cityLabel")}
            </label>
            <select
              id="filter-city"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? t("search.allCities") : c}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[220px] flex-1">
            <span className="mb-2 block text-xs font-medium text-slate-600">{t("search.priceLabel")}</span>
            <div className="flex flex-wrap gap-2">
              {priceOptions.map((opt) => (
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
        <p className="text-xs text-slate-500">{t("search.filtersPersist")}</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border-2 border-indigo-100 bg-white shadow-xl shadow-indigo-100/40">
        <div className="border-b border-slate-100 bg-indigo-50/50 px-4 py-3 sm:px-6">
          <p className="text-sm font-semibold text-indigo-900">
            {t("search.found")} {filtered.length}{" "}
            <span className="font-normal text-indigo-700">
              {t("search.foundHint", { max: MAX_COMPARE })}
            </span>
          </p>
        </div>
        <ul className="max-h-[min(70vh,520px)] divide-y divide-slate-100 overflow-y-auto">
          {filtered.map((u) => {
            const band = formatTuitionBand(u.tuitionOverview);
            const cityShort = u.city.split(",")[0].trim();
            const langs = u.languagesOfInstruction.slice(0, 3).join(" · ");
            const summary = t("search.summary", {
              type: u.type,
              year: u.foundedYear,
              langs,
              count: u.programs.length,
            });
            const checked = compareSet.has(u.id);
            return (
              <li key={u.id} className="flex gap-1 sm:gap-2">
                <div
                  className="flex shrink-0 flex-col items-center gap-2 pt-4 pl-2 sm:pl-3"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => toggleFavoriteUniversity(u.id)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition ${
                      isFavoriteUniversity(u.id)
                        ? "border-amber-300 bg-amber-50 text-amber-600 shadow-sm"
                        : "border-slate-200 bg-white text-slate-400 hover:border-amber-200 hover:text-amber-500"
                    }`}
                    title={
                      isFavoriteUniversity(u.id) ? t("search.favoriteRemove") : t("search.favoriteAdd")
                    }
                    aria-label={
                      isFavoriteUniversity(u.id) ? t("search.favoriteAriaRemove") : t("search.favoriteAriaAdd")
                    }
                  >
                    {isFavoriteUniversity(u.id) ? "★" : "☆"}
                  </button>
                  <label className="flex cursor-pointer flex-col items-center gap-1 text-[10px] text-slate-600 sm:text-xs">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCompare(u.id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      aria-label={t("search.compareAria", { name: getUniversityDisplayName(u, i18n.language) })}
                    />
                    <span className="hidden max-w-[3.5rem] text-center leading-tight sm:inline">
                      {t("search.compare")}
                    </span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => onPickUniversity(u.id)}
                  className="flex min-w-0 flex-1 flex-col gap-2 px-2 py-5 text-left transition hover:bg-indigo-50/80 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:pr-6"
                >
                  <div className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold leading-snug text-slate-900">
                        {getUniversityDisplayName(u, i18n.language)}
                      </span>
                      {recommendedUniversityId === u.id && (
                        <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-900 shadow-sm">
                          {t("search.matchBadge")}
                        </span>
                      )}
                    </span>
                    <p className="mt-1 text-sm text-slate-500">{cityShort}</p>
                    <p className="mt-1 text-sm font-medium text-emerald-800">{band}</p>
                    <p className="mt-2 text-sm text-slate-600">{summary}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{u.scholarshipBlurb}</p>
                  </div>
                  <span className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm sm:self-center">
                    {t("search.open")}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {filtered.length === 0 && (
          <p className="px-6 py-12 text-center text-slate-600">{t("search.empty")}</p>
        )}
      </div>

      {compareLimitHint && (
        <p className="mt-3 text-center text-sm font-medium text-amber-800" role="status">
          {t("search.compareLimit", { max: MAX_COMPARE })}
        </p>
      )}

      {compareIds.length >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center border-t border-indigo-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(79,70,229,0.12)] backdrop-blur-md">
          <div className="flex w-full max-w-lg flex-wrap items-center justify-center gap-3">
            <button
              ref={compareTriggerRef}
              type="button"
              onClick={openCompareDialog}
              aria-haspopup="dialog"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
            >
              {t("search.compareN", { count: compareIds.length })}
            </button>
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
            >
              {t("search.resetSelection")}
            </button>
          </div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-modal="true"
        aria-labelledby="compare-dialog-title"
        className="z-50 w-[min(100%,1120px)] max-w-[calc(100vw-1rem)] rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50"
        onClose={handleCompareDialogClose}
      >
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2
            ref={dialogTitleRef}
            id="compare-dialog-title"
            tabIndex={-1}
            className="text-lg font-semibold text-slate-900 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          >
            {t("search.dialogTitle")}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t("search.dialogHint")}</p>
        </div>
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("search.detailLevel")}
            </span>
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setCompareDetailLevel("compact")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  compareDetailLevel === "compact"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t("search.compact")}
              </button>
              <button
                type="button"
                onClick={() => setCompareDetailLevel("full")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  compareDetailLevel === "full"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t("search.full")}
              </button>
            </div>
            <span className="text-xs tabular-nums text-slate-500">
              {t("search.params", { count: compareRowsVisible.length })}
            </span>
          </div>
          <label className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <span className="text-xs font-medium text-slate-500">{t("search.jumpSection")}</span>
            <select
              className="max-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              defaultValue=""
              onChange={(e) => {
                const id = e.target.value;
                if (id) {
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  e.target.selectedIndex = 0;
                }
              }}
            >
              <option value="">{t("search.pickSection")}</option>
              {COMPARE_SECTION_ORDER.map((sid) => (
                <option key={sid} value={`compare-section-${sid}`}>
                  {t(`compareSection.${sid}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="max-h-[min(75vh,640px)] overflow-x-auto overflow-y-auto px-3 py-3 sm:px-6">
          <p className="mb-2 text-xs font-medium text-slate-500 md:hidden">{t("search.scrollHint")}</p>
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="sticky left-0 z-10 min-w-[200px] bg-white py-3 pr-3 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.08)]">
                  {t("search.paramColumn")}
                </th>
                {comparedUniversities.map((u) => (
                  <th key={u.id} className="min-w-[190px] px-2 py-3 align-bottom">
                    <div className="flex flex-col gap-2">
                      <span className="font-semibold leading-snug text-indigo-900">
                        {getUniversityDisplayName(u, i18n.language)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onPickUniversity(u.id);
                          closeCompareDialog();
                        }}
                        className="w-full rounded-lg bg-indigo-600 px-2 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                      >
                        {t("search.openDashboard")}
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COMPARE_SECTION_ORDER.map((sec) => {
                const rows = compareRowsVisible.filter((r) => r.section === sec);
                if (rows.length === 0) return null;
                const colSpan = 1 + comparedUniversities.length;
                return (
                  <React.Fragment key={sec}>
                    <CompareSectionHeader sectionId={sec} colSpan={colSpan} title={t(`compareSection.${sec}`)} />
                    {rows.map((row) => (
                      <CompareRow
                        key={row.id}
                        label={row.label}
                        values={comparedUniversities.map((u) => {
                          const snap = snapshotById.get(u.id);
                          return snap ? row.pick(u, snap) : "—";
                        })}
                        titleValues={
                          row.title
                            ? comparedUniversities.map((u) => {
                                const snap = snapshotById.get(u.id);
                                if (!snap) return undefined;
                                return row.title!(u, snap);
                              })
                            : undefined
                        }
                      />
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => void handleCopyCompare()}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            {copyDone ? t("search.copyDone") : t("search.copy")}
          </button>
          <button
            type="button"
            onClick={closeCompareDialog}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
          >
            {t("search.close")}
          </button>
        </div>
      </dialog>
    </div>
  );
}

function CompareSectionHeader({
  sectionId,
  colSpan,
  title,
}: {
  sectionId: string;
  colSpan: number;
  title: string;
}) {
  return (
    <tr id={`compare-section-${sectionId}`} className="scroll-mt-28 bg-slate-100/95">
      <td
        colSpan={colSpan}
        className="px-3 py-2.5 text-xs font-bold uppercase tracking-[0.06em] text-slate-600"
      >
        {title}
      </td>
    </tr>
  );
}

function CompareRow({
  label,
  values,
  titleValues,
}: {
  label: string;
  values: string[];
  titleValues?: (string | undefined)[];
}) {
  return (
    <tr className="bg-white even:bg-slate-50/50">
      <th
        scope="row"
        className="sticky left-0 z-[1] bg-inherit py-3 pr-3 align-top text-sm font-medium text-slate-700 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.06)]"
      >
        {label}
      </th>
      {values.map((v, i) => (
        <td
          key={`${label}-${i}`}
          className="max-w-[min(280px,36vw)] px-2 py-3 align-top text-slate-800"
          title={titleValues?.[i] ?? undefined}
        >
          <span className="line-clamp-6 break-words">{v}</span>
        </td>
      ))}
    </tr>
  );
}
