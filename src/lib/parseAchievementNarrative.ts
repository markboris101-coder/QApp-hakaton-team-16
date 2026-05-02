import type { AchievementProfile } from "../mockData";
import { askQwen } from "../services/aiProvider";
import {
  clampAchievementTier,
  clampOtherMerit,
  EMPTY_ACHIEVEMENT_PROFILE,
} from "./achievementProfile";

const SYSTEM = `You are an admissions assistant for universities in Kazakhstan. The user describes olympiads, sports, arts, research, volunteering in free text (may be Russian, Kazakh, or English).

Output ONLY a single JSON object, no markdown. Keys (all required):
- "olympiadTier": integer 0-4 (0=none, 1=school/city, 2=regional, 3=national/republic, 4=international IPhO/IMO level)
- "sportsTier": integer 0-4 (same scale: local → international)
- "otherMerit": integer 0-3 (aggregate for arts, research projects, major volunteering)
- "confidence": number 0-1 (how sure you are)
- "summary": one short sentence in English describing the inferred level

Be conservative: vague or unverifiable claims should get low tiers. If the text is empty of real achievements, use all zeros.`;

function extractJsonObject(text: string): string | null {
  const t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) return fence[1]?.trim() ?? null;
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) return t.slice(start, end + 1);
  return null;
}

function safeParseProfile(raw: string): AchievementProfile | null {
  try {
    const j = JSON.parse(raw) as Record<string, unknown>;
    return {
      olympiadTier: clampAchievementTier(Number(j.olympiadTier)),
      sportsTier: clampAchievementTier(Number(j.sportsTier)),
      otherMerit: clampOtherMerit(Number(j.otherMerit)),
      modelSummary: typeof j.summary === "string" ? j.summary : undefined,
      parseFailed: false,
    };
  } catch {
    return null;
  }
}

/**
 * Грубая оценка без API: ключевые слова (kk/ru/en).
 */
export function parseAchievementNarrativeHeuristic(text: string): AchievementProfile {
  const low = text.toLowerCase();
  if (!low.trim()) {
    return { ...EMPTY_ACHIEVEMENT_PROFILE, narrative: text, modelSummary: "No text provided." };
  }

  let olympiadTier: 0 | 1 | 2 | 3 | 4 = 0;
  if (/\b(iph|imo|ioi|icpc|world|междунар|халықар|international)\b/i.test(text)) olympiadTier = 4;
  else if (/\b(республик|чемпион казахстан|қазақстан|national|финал республ|оқу сапасы)\b/i.test(text)) olympiadTier = 3;
  else if (/\b(област|регион|жәре|regional|obl)\b/i.test(text)) olympiadTier = 2;
  else if (/\b(олимпиад|olympiad|мектеп|школ|қалалық|city|school)\b/i.test(text)) olympiadTier = 1;

  let sportsTier: 0 | 1 | 2 | 3 | 4 = 0;
  if (/\b(чемпион мира|olympic|olympiad|әлем|азия|world cup)\b/i.test(text)) sportsTier = 3;
  else if (/\b(чемпион|kazakhstan|қазақстан|республик|финал)\b/i.test(text) && /\b(спорт|sport|футбол|баскет|жүзу|athlete)\b/i.test(text))
    sportsTier = 2;
  else if (/\b(спорт|sport|команда|чемпион школ)\b/i.test(text)) sportsTier = 1;

  let om = 0;
  if (/\b(arxiv|publication|исслед|research|стартап|hackathon)\b/i.test(text)) om = Math.max(om, 2);
  if (/\b(волонтер|volunteer|қоғамдық|обществен)\b/i.test(text)) om = Math.max(om, 1);
  if (/\b(искусств|театр|music|хор|exhibition)\b/i.test(text)) om = Math.max(om, 1);
  const otherMerit = clampOtherMerit(om);

  return {
    olympiadTier,
    sportsTier,
    otherMerit,
    narrative: text,
    modelSummary: "Heuristic parse (no AI key). Tiers may be rough.",
    parseFailed: false,
  };
}

export async function parseAchievementNarrativeWithQwen(narrative: string): Promise<AchievementProfile> {
  const trimmed = narrative.trim();
  if (!trimmed) {
    return { ...EMPTY_ACHIEVEMENT_PROFILE, narrative: trimmed };
  }

  const userPrompt = `User achievements narrative:\n"""${trimmed.slice(0, 4000)}"""`;

  const raw = await askQwen(userPrompt, SYSTEM);
  const jsonStr = extractJsonObject(raw);
  const parsed = jsonStr ? safeParseProfile(jsonStr) : null;

  if (!parsed) {
    return {
      ...EMPTY_ACHIEVEMENT_PROFILE,
      narrative: trimmed,
      parseFailed: true,
      modelSummary: "Could not parse JSON from model.",
    };
  }

  return {
    ...parsed,
    narrative: trimmed,
    parsedAt: new Date().toISOString(),
    parseFailed: false,
  };
}
