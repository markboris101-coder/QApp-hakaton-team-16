/** Разбор ответа модели с финальной строкой VERDICT: ACCEPT | REJECT */

export type AiVerdictParse = "accept" | "reject" | "unknown";

export function parseAchievementVerdict(text: string): AiVerdictParse {
  const upper = text.toUpperCase();
  if (/VERDICT\s*:\s*ACCEPT\b/.test(upper)) return "accept";
  if (/VERDICT\s*:\s*REJECT\b/.test(upper)) return "reject";
  return "unknown";
}
