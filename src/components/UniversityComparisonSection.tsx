import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { calculateFitScore } from "../calculateFitScore";
import { useProfile } from "../context/ProfileContext";
import { getUniversityDisplayName } from "../lib/universityLabels";
import type { UniversityTemplate } from "../mockData";

function averageFitForUniversity(student: Parameters<typeof calculateFitScore>[0], u: UniversityTemplate): number {
  if (!u.programs.length) return 0;
  let sum = 0;
  for (const p of u.programs) {
    sum += calculateFitScore(student, p, u.admissionExpectations).score;
  }
  return Math.round(sum / u.programs.length);
}

export function UniversityComparisonSection() {
  const { t, i18n } = useTranslation();
  const {
    student,
    universities,
    selectedUniversityId,
    setSelectedUniversityId,
    favoriteUniversityIds,
    toggleFavoriteUniversity,
  } = useProfile();

  const cards = useMemo(() => {
    return universities
      .filter((u) => u.id !== selectedUniversityId)
      .map((u) => ({
        u,
        fit: averageFitForUniversity(student, u),
      }))
      .sort((a, b) => b.fit - a.fit)
      .slice(0, 6);
  }, [universities, selectedUniversityId, student]);

  if (cards.length === 0) return null;

  return (
    <section id="university-comparison" className="scroll-mt-24 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{t("compareWithOthers.kicker")}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t("compareWithOthers.title")}</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">{t("compareWithOthers.subtitle")}</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ u, fit }) => {
          const name = getUniversityDisplayName(u, i18n.language);
          const fav = favoriteUniversityIds.includes(u.id);
          return (
            <li
              key={u.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/80 to-white p-5 shadow-sm ring-1 ring-slate-100"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold leading-snug text-slate-900">{name}</h3>
                  <p className="mt-1 text-xs text-slate-600">{u.city}</p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white tabular-nums">
                  {fit}
                </div>
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">{t("compareWithOthers.avgFit")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUniversityId(u.id)}
                  className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  {t("compareWithOthers.open")}
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavoriteUniversity(u.id)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    fav
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {fav ? t("compareWithOthers.favoriteRemove") : t("compareWithOthers.favorite")}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
