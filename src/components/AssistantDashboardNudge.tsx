import React from "react";
import { useTranslation } from "react-i18next";
import type { UniversityRecommendation } from "../lib/recommendUniversity";

type Props = {
  recommendation: UniversityRecommendation;
  currentUniversityName: string;
  onSwitchToRecommended: () => void;
};

export function AssistantDashboardNudge({
  recommendation,
  currentUniversityName,
  onSwitchToRecommended,
}: Props) {
  const { t } = useTranslation();
  return (
    <section className="mb-10 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 shadow-sm ring-1 ring-violet-100 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">{t("nudge.kicker")}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {t("nudge.body", {
              recName: recommendation.universityName,
              score: recommendation.score,
              current: currentUniversityName,
            })}
          </p>
          <p className="mt-1 text-xs text-slate-600">{t("nudge.line2")}</p>
        </div>
        <button
          type="button"
          onClick={onSwitchToRecommended}
          className="shrink-0 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          {t("nudge.cta")}
        </button>
      </div>
    </section>
  );
}
