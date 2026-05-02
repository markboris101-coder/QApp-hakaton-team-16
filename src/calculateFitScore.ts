import type { ProgramField, StudentProfile, UniversityProgram } from "./mockData";

/** Порог GPA из ТЗ: выше — бонус к Fit Score */
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

function olympiadAppliesToField(field: ProgramField): boolean {
  return field === "Science" || field === "Engineering";
}

/** SAT Total 0–1600: мягкие диапазоны */
function satMultiplier(sat: number): number {
  if (sat >= 1450) return 1.08;
  if (sat >= 1300) return 1.05;
  if (sat >= 1150) return 1.02;
  if (sat > 0 && sat < 1050) return 0.96;
  return 1;
}

/** UNT/ЕНТ 0–140 */
function untMultiplier(unt: number): number {
  if (unt >= 125) return 1.06;
  if (unt >= 110) return 1.04;
  if (unt >= 95) return 1.02;
  if (unt > 0 && unt < 75) return 0.97;
  return 1;
}

/**
 * Динамический Fit Score.
 * Учитывает GPA, интересы, IELTS, SAT, UNT/ЕНТ и награды (Olympiad → +15% для Science/Engineering).
 */
export function calculateFitScore(student: StudentProfile, program: UniversityProgram): FitScoreResult {
  let score = program.fitScore;

  if (student.academic.gpa > GPA_FIT_THRESHOLD) {
    score *= 1.2;
  }

  if (interestMatchesProgramField(student.preferences.interests, program.field)) {
    score *= 1.3;
  }

  let englishWarning: string | undefined;
  if (student.academic.ielts < 6.5) {
    score *= 0.45;
    englishWarning = "Warning: low English level";
  }

  score *= satMultiplier(student.academic.sat);
  score *= untMultiplier(student.academic.untScore);

  if (hasOlympiadAward(student.awards) && olympiadAppliesToField(program.field)) {
    score *= 1.15;
  }

  const clamped = Math.round(Math.min(100, Math.max(0, score)));
  return { score: clamped, englishWarning };
}
