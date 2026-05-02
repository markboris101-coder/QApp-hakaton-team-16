import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { UniversityRecommendation } from "../lib/recommendUniversity";
import { useProfile } from "../context/ProfileContext";
import { getUniversityDisplayName } from "../lib/universityLabels";

type Props = {
  recommendation: UniversityRecommendation;
  onOpenRecommended: () => void;
  onScrollToCatalog: () => void;
};

export function AssistantRecommendationHero({
  recommendation,
  onOpenRecommended,
  onScrollToCatalog,
}: Props) {
  const { t, i18n } = useTranslation();
  const { universities } = useProfile();
  const recName = useMemo(() => {
    const u = universities.find((x) => x.id === recommendation.universityId);
    return u ? getUniversityDisplayName(u, i18n.language) : recommendation.universityName;
  }, [universities, recommendation.universityId, recommendation.universityName, i18n.language]);
  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-indigo-300/80 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 p-6 text-white shadow-xl shadow-indigo-300/30 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-100">{t("heroRec.kicker")}</p>
        <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
          {t("heroRec.title")}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-indigo-50">
          {t("heroRec.lead")}{" "}
          <span className="font-semibold text-white">{recName}</span>.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-white/15 px-4 py-2 ring-1 ring-white/25 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-100">{t("heroRec.matchIndex")}</p>
            <p className="text-3xl font-bold tabular-nums">{recommendation.score}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-indigo-50 ring-1 ring-white/20">
            {t("heroRec.avgFit")}{" "}
            <span className="font-semibold tabular-nums text-white">{recommendation.avgProgramFit}%</span>
          </div>
        </div>

        <ul className="mt-6 space-y-2.5 text-sm leading-relaxed text-indigo-50">
          {recommendation.reasons.slice(0, 4).map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" aria-hidden />
              <span>{r}</span>
            </li>
          ))}
        </ul>

        {recommendation.topPrograms.length > 0 && (
          <div className="mt-6 rounded-2xl bg-black/20 p-4 ring-1 ring-white/15">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-100">{t("heroRec.topPrograms")}</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {recommendation.topPrograms.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate text-indigo-50">{p.name}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-white">{p.score}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onOpenRecommended}
            className="rounded-2xl bg-white px-6 py-3.5 text-center text-base font-bold text-indigo-800 shadow-lg transition hover:bg-indigo-50"
          >
            {t("heroRec.openBtn")}
          </button>
          <button
            type="button"
            onClick={onScrollToCatalog}
            className="rounded-2xl border-2 border-white/40 bg-transparent px-6 py-3.5 text-center text-base font-semibold text-white transition hover:bg-white/10"
          >
            {t("heroRec.compareBtn")}
          </button>
        </div>
      </div>
    </section>
  );
}
