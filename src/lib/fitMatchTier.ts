/** Статусы совместимости по §10.C ТЗ QApp (Qualified / Strong Match / Partial Match / Low Match). */

export type FitMatchTier = "strong" | "qualified" | "partial" | "low";

export function getFitMatchTier(overallFitPercent: number): FitMatchTier {
  const p = overallFitPercent;
  if (p >= 80) return "strong";
  if (p >= 65) return "qualified";
  if (p >= 45) return "partial";
  return "low";
}
