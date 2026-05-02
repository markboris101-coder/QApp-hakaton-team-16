import type { AchievementProfile, AchievementTier, OtherMeritTier, StudentProfile } from "../mockData";

export const EMPTY_ACHIEVEMENT_PROFILE: AchievementProfile = {
  olympiadTier: 0,
  sportsTier: 0,
  otherMerit: 0,
};

export function resolveAchievementProfile(student: StudentProfile): AchievementProfile {
  return { ...EMPTY_ACHIEVEMENT_PROFILE, ...student.achievementProfile };
}

export function clampAchievementTier(n: number): AchievementTier {
  const x = Math.max(0, Math.min(4, Math.round(Number(n)) || 0));
  return x as AchievementTier;
}

export function clampOtherMerit(n: number): OtherMeritTier {
  const x = Math.max(0, Math.min(3, Math.round(Number(n)) || 0));
  return x as OtherMeritTier;
}

/**
 * Синтез чекбоксов наград из уровней (для анкеты и после парсинга).
 */
export function awardsDerivedFromTiers(p: AchievementProfile): string[] {
  const s = new Set<string>();
  if (p.olympiadTier >= 1) s.add("Olympiad Winner");
  if (p.sportsTier >= 1) s.add("Sports Achievement");
  if (p.otherMerit >= 1) s.add("Volunteering Leader");
  if (p.otherMerit >= 2) s.add("Research Project");
  if (p.otherMerit >= 3) s.add("Arts Excellence");
  return Array.from(s);
}

/**
 * Объединить вручную отмеченные награды с выведенными из уровней.
 */
export function mergeAwardsWithTiers(existing: string[], p: AchievementProfile): string[] {
  const derived = awardsDerivedFromTiers(p);
  return Array.from(new Set([...existing, ...derived]));
}
