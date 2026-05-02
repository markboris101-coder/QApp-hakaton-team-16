/** Ограничения и нормализация полей профиля (защита от «бесконечных» значений и дробей IELTS). */

export const SAT_MIN = 0;
export const SAT_MAX = 1600;
export const UNT_MIN = 0;
export const UNT_MAX = 140;
export const GPA_MIN = 0;
export const GPA_MAX = 5;
export const IELTS_MIN = 0;
export const IELTS_MAX = 9;

/** IELTS только с шагом 0.5 (официальные бэнды). */
export const IELTS_HALF_BANDS: number[] = Array.from({ length: 19 }, (_, i) => Math.round(i * 0.5 * 10) / 10);

export function clampSat(n: number): number {
  if (!Number.isFinite(n)) return SAT_MIN;
  return Math.min(SAT_MAX, Math.max(SAT_MIN, Math.round(n)));
}

/** Для подписей в UI: `0` трактуем как «не указан». */
export function formatSatForDisplay(sat: number): string {
  return sat > 0 ? String(sat) : "не указан";
}

export function clampUnt(n: number): number {
  if (!Number.isFinite(n)) return UNT_MIN;
  return Math.min(UNT_MAX, Math.max(UNT_MIN, Math.round(n)));
}

export function clampGpa(n: number): number {
  if (!Number.isFinite(n)) return GPA_MIN;
  const r = Math.round(n * 10) / 10;
  return Math.min(GPA_MAX, Math.max(GPA_MIN, r));
}

/** Ближайший допустимый бэнд IELTS (0.5). */
export function roundIeltsHalfBand(n: number): number {
  if (!Number.isFinite(n)) return IELTS_MIN;
  const stepped = Math.round(n * 2) / 2;
  return Math.min(IELTS_MAX, Math.max(IELTS_MIN, stepped));
}

export function parseIntBounded(raw: string, min: number, max: number, fallback: number): number {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "-") return fallback;
  const n = Number.parseInt(trimmed, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function parseFloatBounded(raw: string, min: number, max: number, fallback: number): number {
  const trimmed = raw.replace(",", ".").trim();
  if (trimmed === "" || trimmed === "-" || trimmed === ".") return fallback;
  const n = Number.parseFloat(trimmed);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
