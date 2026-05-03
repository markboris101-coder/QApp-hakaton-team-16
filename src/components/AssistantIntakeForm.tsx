import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { AchievementProfile, FinancialSituation, StudentProfile } from "../mockData";
import { AchievementNarrativeBlock } from "./AchievementNarrativeBlock";
import { EMPTY_ACHIEVEMENT_PROFILE, mergeAwardsWithTiers } from "../lib/achievementProfile";
import { parseAchievementNarrativeHeuristic, parseAchievementNarrativeWithQwen } from "../lib/parseAchievementNarrative";
import { isAiConfigured } from "../services/aiProvider";
import {
  clampGpa,
  clampSat,
  clampUnt,
  IELTS_HALF_BANDS,
  parseFloatBounded,
  parseIntBounded,
  roundIeltsHalfBand,
} from "../lib/academicInput";
import { INTEREST_OPTIONS } from "./ProfileEditorForm";
import { useProfile } from "../context/ProfileContext";

const FINANCIAL_OPTIONS: FinancialSituation[] = ["Need Full Scholarship", "Partial Scholarship", "Self-funded"];

type Props = {
  onComplete: () => void;
};

function financialLabel(f: FinancialSituation, t: (k: string) => string) {
  if (f === "Need Full Scholarship") return t("financial.needFull");
  if (f === "Partial Scholarship") return t("financial.partial");
  return t("financial.selfFunded");
}

export function AssistantIntakeForm({ onComplete }: Props) {
  const { t } = useTranslation();
  const { setStudent } = useProfile();
  const [gpa, setGpa] = useState("");
  const [ielts, setIelts] = useState(String(IELTS_HALF_BANDS[14] ?? 6.5));
  const [sat, setSat] = useState("");
  const [unt, setUnt] = useState("");
  const [city, setCity] = useState("");
  const [financialStatus, setFinancialStatus] = useState<FinancialSituation>("Need Full Scholarship");
  const [interests, setInterests] = useState<string[]>([]);
  const [achievementText, setAchievementText] = useState("");
  const [parsedSnap, setParsedSnap] = useState<{ text: string; profile: AchievementProfile } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (opt: string) => {
    setInterests((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const gpaN = parseFloatBounded(gpa, 0, 5, NaN);
    if (!Number.isFinite(gpaN) || gpa.trim() === "") {
      setError(t("intake.errGpa"));
      return;
    }

    const satN =
      sat.trim() === "" ? 0 : parseIntBounded(sat, 0, 1600, NaN);
    if (!Number.isFinite(satN)) {
      setError(t("intake.errSat"));
      return;
    }

    const untN = parseIntBounded(unt, 0, 140, NaN);
    if (!Number.isFinite(untN) || unt.trim() === "") {
      setError(t("intake.errUnt"));
      return;
    }

    if (!city.trim()) {
      setError(t("intake.errCity"));
      return;
    }

    if (interests.length === 0) {
      setError(t("intake.errInterests"));
      return;
    }

    const ieltsN = roundIeltsHalfBand(Number.parseFloat(ielts));

    setSubmitting(true);
    try {
      const trimmedAch = achievementText.trim();
      let achievementProfile: AchievementProfile = { ...EMPTY_ACHIEVEMENT_PROFILE };
      if (trimmedAch) {
        if (parsedSnap && parsedSnap.text === trimmedAch) {
          achievementProfile = { ...parsedSnap.profile, narrative: trimmedAch };
        } else {
          try {
            achievementProfile = isAiConfigured()
              ? await parseAchievementNarrativeWithQwen(trimmedAch)
              : parseAchievementNarrativeHeuristic(trimmedAch);
            achievementProfile = { ...achievementProfile, narrative: trimmedAch };
          } catch {
            achievementProfile = {
              ...parseAchievementNarrativeHeuristic(trimmedAch),
              narrative: trimmedAch,
              parseFailed: true,
            };
          }
        }
      }

      setStudent((prev: StudentProfile) => ({
        ...prev,
        academic: {
          ...prev.academic,
          gpa: clampGpa(gpaN),
          ielts: ieltsN,
          sat: clampSat(satN),
          untScore: clampUnt(untN),
        },
        preferences: {
          ...prev.preferences,
          city: city.trim(),
          financialStatus,
          interests,
        },
        achievementProfile,
        awards: mergeAwardsWithTiers(prev.awards, achievementProfile),
      }));

      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      id="assistant-intake-form"
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-28 rounded-3xl border-2 border-indigo-200/90 bg-white p-6 shadow-xl shadow-indigo-100/40 ring-1 ring-indigo-100/80 sm:p-8"
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">{t("intake.step")}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t("intake.title")}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
        {t("intake.intro")}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("intake.gpa")}</span>
            <input
              required
              type="text"
              inputMode="decimal"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              placeholder={t("intake.gpaPlaceholder")}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("intake.ielts")}</span>
            <select
              value={ielts}
              onChange={(e) => setIelts(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {IELTS_HALF_BANDS.map((b) => (
                <option key={b} value={String(b)}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("intake.satLabel")}</span>
            <input
              type="text"
              inputMode="numeric"
              value={sat}
              onChange={(e) => setSat(e.target.value)}
              placeholder={t("intake.satPlaceholder")}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <span className="mt-1 block text-xs text-slate-500">{t("intake.satHint")}</span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("intake.unt")}</span>
            <input
              required
              type="text"
              inputMode="numeric"
              value={unt}
              onChange={(e) => setUnt(e.target.value)}
              placeholder="0–140"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">{t("intake.city")}</span>
          <input
            required
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t("intake.cityPlaceholder")}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </label>

        <div>
          <span className="text-sm font-medium text-slate-700">{t("intake.financial")}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {FINANCIAL_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFinancialStatus(f)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  financialStatus === f
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200/80"
                }`}
              >
                {financialLabel(f, t)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-slate-700">{t("intake.interests")}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleInterest(opt)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  interests.includes(opt)
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200/80"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <AchievementNarrativeBlock
          variant="intake"
          narrative={achievementText}
          onNarrativeChange={setAchievementText}
          onParsed={(profile, sourceText) => setParsedSnap({ text: sourceText, profile })}
          disabled={submitting}
        />

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-60 sm:w-auto sm:px-10"
        >
          {submitting ? t("intake.submitting") : t("intake.submit")}
        </button>
      </form>
    </motion.section>
  );
}
