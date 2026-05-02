import { calculateFitScore } from "../calculateFitScore";
import type { StudentProfile, UniversityTemplate } from "../mockData";
import { formatTuitionBand } from "../mockData";
import i18n from "../i18n/config";
import { resolveAchievementProfile } from "./achievementProfile";

export type UniversityRecommendation = {
  universityId: string;
  universityName: string;
  /** Итоговый балл ассистента 0–100 */
  score: number;
  avgProgramFit: number;
  budgetFit: number;
  cityBoost: number;
  reasons: string[];
  topPrograms: { id: string; name: string; score: number }[];
  /** Часть программ с предупреждением по английскому */
  englishRisk: boolean;
};

function budgetFitScore(student: StudentProfile, u: UniversityTemplate): number {
  const fs = student.preferences.financialStatus;
  const minKzt = u.tuitionOverview.minKzt;
  const highScholarships = u.scholarships.filter((s) => s.aiRelevance === "High").length;

  if (fs === "Need Full Scholarship") {
    let s = 50;
    if (minKzt <= 3_800_000) s = 94;
    else if (minKzt <= 6_000_000) s = 80;
    else if (minKzt <= 9_000_000) s = 68;
    else s = 52;
    s += Math.min(18, highScholarships * 6);
    return Math.min(100, Math.round(s));
  }
  if (fs === "Partial Scholarship") {
    if (minKzt <= 6_500_000) return 88;
    if (minKzt <= 11_000_000) return 74;
    return 58;
  }
  return 84;
}

function cityBoostPoints(student: StudentProfile, u: UniversityTemplate): number {
  const pref = student.preferences.city?.trim().toLowerCase() ?? "";
  if (pref.length < 2) return 0;
  const blob = `${u.city} ${u.name}`.toLowerCase();
  if (blob.includes(pref)) return 12;
  const words = pref.split(/\s+/).filter((w) => w.length > 2);
  if (words.some((w) => blob.includes(w))) return 8;
  return 0;
}

/**
 * Ранжирует вузы для абитуриента: средний AI Fit по программам + бюджет + город из профиля.
 */
export function getUniversityRecommendations(
  student: StudentProfile,
  universities: UniversityTemplate[]
): UniversityRecommendation[] {
  const out: UniversityRecommendation[] = [];

  for (const u of universities) {
    const fits = u.programs.map((program) => ({
      program,
      ...calculateFitScore(student, program, u.admissionExpectations),
    }));

    const scores = fits.map((f) => f.score);
    const avgProgramFit = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const englishRisk =
      fits.filter((f) => f.englishWarning || student.academic.ielts < u.admissionExpectations.minIelts).length >=
      Math.ceil(fits.length * 0.35);

    const budgetFit = budgetFitScore(student, u);
    const cityBoost = cityBoostPoints(student, u);

    const composite = Math.min(
      100,
      Math.round(0.62 * avgProgramFit + 0.28 * budgetFit + cityBoost)
    );

    const topPrograms = [...fits]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((f) => ({ id: f.program.id, name: f.program.name, score: f.score }));

    const reasons: string[] = [];

    reasons.push(
      student.academic.sat > 0
        ? i18n.t("recommend.fitWithSat", { pct: Math.round(avgProgramFit) })
        : i18n.t("recommend.fitNoSat", { pct: Math.round(avgProgramFit) })
    );

    if (cityBoost > 0) {
      reasons.push(i18n.t("recommend.cityMatch", { city: student.preferences.city }));
    }

    if (student.preferences.financialStatus === "Need Full Scholarship") {
      if (budgetFit >= 82) {
        reasons.push(i18n.t("recommend.budgetOk", { band: formatTuitionBand(u.tuitionOverview) }));
      } else {
        reasons.push(i18n.t("recommend.budgetWarn", { band: formatTuitionBand(u.tuitionOverview) }));
      }
    } else if (student.preferences.financialStatus === "Partial Scholarship") {
      reasons.push(i18n.t("recommend.partial"));
    } else {
      reasons.push(i18n.t("recommend.selfPay"));
    }

    const interestHits = fits.filter((f) =>
      student.preferences.interests.some((i) => {
        const map: Record<string, string[]> = {
          "Computer Science": ["Engineering", "Science"],
          STEM: ["Engineering", "Science"],
          Engineering: ["Engineering"],
          Business: ["Business"],
          Science: ["Science"],
          Law: ["Law"],
          Humanities: ["Humanities"],
          "Social Sciences": ["Social Sciences"],
          Medicine: ["Medicine"],
        };
        return map[i]?.includes(f.program.field);
      })
    ).length;
    if (interestHits > 0) {
      reasons.push(
        i18n.t("recommend.interestHits", {
          count: interestHits,
          list: student.preferences.interests.slice(0, 3).join(", "),
        })
      );
    }

    const ach = resolveAchievementProfile(student);
    if (ach.olympiadTier > 0 || ach.sportsTier > 0 || ach.otherMerit > 0) {
      reasons.push(
        i18n.t("recommend.achievementBoost", {
          o: ach.olympiadTier,
          s: ach.sportsTier,
          m: ach.otherMerit,
        })
      );
    }

    if (englishRisk) {
      reasons.push(i18n.t("recommend.englishRisk", { ielts: student.academic.ielts.toFixed(1) }));
    }

    out.push({
      universityId: u.id,
      universityName: u.name,
      score: composite,
      avgProgramFit: Math.round(avgProgramFit),
      budgetFit,
      cityBoost,
      reasons: reasons.slice(0, 6),
      topPrograms,
      englishRisk,
    });
  }

  return out.sort((a, b) => b.score - a.score);
}

export function getTopUniversityRecommendation(
  student: StudentProfile,
  universities: UniversityTemplate[]
): UniversityRecommendation | null {
  const r = getUniversityRecommendations(student, universities);
  return r[0] ?? null;
}
