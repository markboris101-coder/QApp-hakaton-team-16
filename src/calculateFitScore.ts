import type { ProgramField, StudentProfile, UniversityAdmissionExpectations, UniversityProgram } from "./mockData";
import { clampAchievementTier, clampOtherMerit, resolveAchievementProfile } from "./lib/achievementProfile";

/** @deprecated Используйте `universityData.admissionExpectations.strongGpa` в UI. */
export const GPA_FIT_THRESHOLD = 4.5;

const INTEREST_TO_FIELDS: Record<string, ProgramField[]> = {
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

export interface FitScoreResult {
  score: number;
  englishWarning?: string;
}

function interestMatchesProgramField(interests: string[], field: ProgramField): boolean {
  return interests.some((interest) => {
    const fields = INTEREST_TO_FIELDS[interest];
    return fields?.includes(field) ?? false;
  });
}

function hasOlympiadAward(awards: string[]): boolean {
  return awards.some((a) => /olympiad/i.test(a));
}

function hasSportsAward(awards: string[]): boolean {
  return awards.some((a) => /sports/i.test(a));
}

/** Учитываем и новый achievementProfile, и старые чекбоксы без профиля. */
function effectiveOlympiadTier(student: StudentProfile): number {
  const a = resolveAchievementProfile(student);
  let t = a.olympiadTier;
  if (t === 0 && hasOlympiadAward(student.awards)) t = 1;
  return clampAchievementTier(t);
}

function effectiveSportsTier(student: StudentProfile): number {
  const a = resolveAchievementProfile(student);
  let t = a.sportsTier;
  if (t === 0 && hasSportsAward(student.awards)) t = 1;
  return clampAchievementTier(t);
}

function effectiveOtherMerit(student: StudentProfile): number {
  return clampOtherMerit(resolveAchievementProfile(student).otherMerit);
}

function olympiadAppliesToField(field: ProgramField): boolean {
  return field === "Science" || field === "Engineering";
}

/**
 * Суровая кривая GPA: 3.5 и ниже — низкая академическая жизнеспособность для конкурентного NU,
 * даже при сильных SAT/UNT (как в реальном пуле мерит-рассмотрения).
 */
function gpaPortfolioFactor(gpa: number, exp: UniversityAdmissionExpectations): number {
  if (gpa >= exp.strongGpa) return 1;
  if (gpa >= 4.2) return 0.88;
  if (gpa >= exp.competitiveGpa) return 0.72;
  if (gpa >= 3.85) return 0.52;
  if (gpa >= 3.5) return 0.34;
  if (gpa >= 3.0) return 0.22;
  return 0.14;
}

/** Жёсткий потолок % Fit по GPA (реалистичный «потолок шансов» для вуза уровня NU). */
function gpaAbsoluteCeiling(
  gpa: number,
  exp: UniversityAdmissionExpectations,
  student: StudentProfile
): number {
  let cap: number;
  if (gpa >= exp.strongGpa) cap = 96;
  else if (gpa >= 4.2) cap = 86;
  else if (gpa >= exp.competitiveGpa) cap = 72;
  else if (gpa >= 3.85) cap = 56;
  else if (gpa >= 3.5) cap = 44;
  else if (gpa >= 3.0) cap = 32;
  else cap = 22;

  if (gpa >= exp.competitiveGpa) return cap;

  const ach = resolveAchievementProfile(student);
  const oTier = effectiveOlympiadTier(student);
  const verified = student.olympiadVerified === true;

  if (verified && oTier >= 1) {
    cap = Math.min(100, cap + 8);
  } else if (oTier >= 3) {
    cap = Math.min(100, cap + 5);
  } else if (oTier >= 1 && ach.narrative?.trim()) {
    cap = Math.min(100, cap + 3);
  }

  return cap;
}

/**
 * В прототипе `sat === 0` означает «не указывал / не сдавали», а не реальный балл.
 * Таких пользователей не штрафуем — опора на GPA и UNT (типично для подачи в РК).
 */
function satMultiplier(sat: number, exp: UniversityAdmissionExpectations): number {
  if (!sat || sat <= 0) return 1;
  if (sat >= exp.targetSat) return 1.05;
  if (sat >= exp.competitiveSat) return 1;
  if (sat >= exp.competitiveSat - 120) return 0.9;
  if (sat < 1100) return 0.72;
  return 0.84;
}

function untMultiplier(unt: number, exp: UniversityAdmissionExpectations): number {
  if (unt >= exp.targetUnt) return 1.04;
  if (unt >= exp.competitiveUnt) return 1;
  if (unt >= 95) return 0.9;
  if (unt > 0 && unt < 85) return 0.78;
  return 0.88;
}

/**
 * Динамический Fit Score с привязкой к ожиданиям конкретного вуза.
 * Маленький GPA не «компенсируется» сильным SAT — итог ограничен потолком gpaAbsoluteCeiling.
 */
export function calculateFitScore(
  student: StudentProfile,
  program: UniversityProgram,
  exp: UniversityAdmissionExpectations
): FitScoreResult {
  let score = program.fitScore;

  score *= gpaPortfolioFactor(student.academic.gpa, exp);

  if (interestMatchesProgramField(student.preferences.interests, program.field)) {
    score *= 1.07;
  }

  let englishWarning: string | undefined;
  if (student.academic.ielts < exp.minIelts) {
    score *= 0.4;
    englishWarning = "Warning: low English level";
  }

  score *= satMultiplier(student.academic.sat, exp);
  score *= untMultiplier(student.academic.untScore, exp);

  const oTier = effectiveOlympiadTier(student);
  const sTier = effectiveSportsTier(student);
  const other = effectiveOtherMerit(student);
  const verified = student.olympiadVerified === true;

  if (olympiadAppliesToField(program.field) && oTier > 0) {
    const inc = 0.018 * oTier;
    const trust = verified ? 1 : 0.88;
    score *= Math.min(1.1, 1 + inc * trust);
  }

  if (sTier > 0) {
    const inc = 0.014 * sTier;
    score *= Math.min(1.06, 1 + inc * 0.92);
  }

  if (other > 0) {
    score *= Math.min(1.035, 1 + 0.009 * other);
  }

  const ceiling = gpaAbsoluteCeiling(student.academic.gpa, exp, student);
  const rounded = Math.round(Math.min(100, Math.max(0, score)));
  const clamped = Math.min(ceiling, rounded);
  return { score: clamped, englishWarning };
}
