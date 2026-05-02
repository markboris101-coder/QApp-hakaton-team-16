import React from "react";
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
  return (
    <section className="mb-10 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 shadow-sm ring-1 ring-violet-100 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Совет ассистента</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            Для вашего профиля сейчас сильнее матч —{" "}
            <span className="text-indigo-800">{recommendation.universityName}</span>
            <span className="font-normal text-slate-600"> (индекс {recommendation.score}), чем текущий экран </span>
            <span className="text-slate-700">{currentUniversityName}</span>.
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Вы всё ещё можете работать с текущим вузом — это подсказка, а не ограничение.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToRecommended}
          className="shrink-0 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          Переключить на рекомендованный
        </button>
      </div>
    </section>
  );
}
