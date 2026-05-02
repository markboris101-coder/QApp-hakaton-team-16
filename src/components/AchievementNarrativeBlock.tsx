import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AchievementProfile } from "../mockData";
import { EMPTY_ACHIEVEMENT_PROFILE } from "../lib/achievementProfile";
import {
  parseAchievementNarrativeHeuristic,
  parseAchievementNarrativeWithQwen,
} from "../lib/parseAchievementNarrative";
import { isAiConfigured } from "../services/aiProvider";

type Props = {
  narrative: string;
  onNarrativeChange: (value: string) => void;
  /** Текущее сохранённое в профиле (для отображения шкал, если ещё не жали «оценить») */
  savedProfile?: AchievementProfile;
  onParsed?: (profile: AchievementProfile, sourceText: string) => void;
  onNarrativeBlur?: () => void;
  disabled?: boolean;
  variant?: "intake" | "profile";
};

function TierBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 shrink-0 text-slate-600">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
      <span className="w-6 tabular-nums text-slate-800">{value}</span>
    </div>
  );
}

export function AchievementNarrativeBlock({
  narrative,
  onNarrativeChange,
  savedProfile,
  onParsed,
  onNarrativeBlur,
  disabled,
  variant = "profile",
}: Props) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPreview, setLastPreview] = useState<AchievementProfile | null>(null);

  const mergedSaved = savedProfile ? { ...EMPTY_ACHIEVEMENT_PROFILE, ...savedProfile } : null;
  const display = lastPreview ?? mergedSaved;

  const handleParse = async () => {
    setError(null);
    const text = narrative.trim();
    if (!text) {
      setError(t("intake.achievementsErrEmpty"));
      return;
    }
    setBusy(true);
    try {
      let profile: AchievementProfile;
      if (isAiConfigured()) {
        profile = await parseAchievementNarrativeWithQwen(text);
      } else {
        profile = parseAchievementNarrativeHeuristic(text);
      }
      setLastPreview(profile);
      onParsed?.(profile, text);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("intake.achievementsErrParse"));
      const fallback = parseAchievementNarrativeHeuristic(text);
      const merged = { ...fallback, parseFailed: true };
      setLastPreview(merged);
      onParsed?.(merged, text);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={variant === "intake" ? "space-y-3" : "space-y-4"}>
      <div>
        <span className="text-sm font-medium text-slate-700">{t("intake.achievementsTitle")}</span>
        <p className="mt-1 text-xs text-slate-500">{t("intake.achievementsHint")}</p>
        <textarea
          value={narrative}
          onChange={(e) => onNarrativeChange(e.target.value)}
          onBlur={() => onNarrativeBlur?.()}
          disabled={disabled || busy}
          rows={variant === "intake" ? 4 : 5}
          placeholder={t("intake.achievementsPlaceholder")}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void handleParse()}
          disabled={disabled || busy}
          className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-100 disabled:opacity-50"
        >
          {busy ? t("intake.achievementsParsing") : t("intake.achievementsParse")}
        </button>
        {!isAiConfigured() && (
          <span className="text-xs text-amber-800">{t("intake.achievementsNoKey")}</span>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">{error}</p>
      )}

      {display && (display.olympiadTier > 0 || display.sportsTier > 0 || display.otherMerit > 0 || display.modelSummary) ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{t("intake.achievementsPreviewTitle")}</p>
          <div className="mt-3 space-y-2">
            <TierBar label={t("intake.tierOlympiad")} value={display.olympiadTier} max={4} />
            <TierBar label={t("intake.tierSports")} value={display.sportsTier} max={4} />
            <TierBar label={t("intake.tierOther")} value={display.otherMerit} max={3} />
          </div>
          {display.modelSummary && (
            <p className="mt-3 text-xs leading-relaxed text-slate-700">
              <span className="font-medium text-slate-800">{t("intake.achievementsSummary")}</span> {display.modelSummary}
            </p>
          )}
          {display.parseFailed && (
            <p className="mt-2 text-xs text-amber-800">{t("intake.achievementsParseFallback")}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
