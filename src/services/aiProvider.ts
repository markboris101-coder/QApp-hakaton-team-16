/**
 * Вызов LLM (Qwen 2.5) через OpenAI-совместимый API.
 * По умолчанию: OpenRouter (`https://openrouter.ai/api/v1/chat/completions`).
 *
 * Переменные окружения (`.env.local`, префикс Vite `VITE_`):
 * - `VITE_API_KEY` — основной ключ (как в ТЗ)
 * - `VITE_OPENROUTER_API_KEY` — альтернатива
 * - `VITE_AI_BASE_URL` — опционально, другой совместимый endpoint (Groq, HF router и т.д.)
 * - `VITE_AI_MODEL` — опционально, по умолчанию Qwen 2.5 на OpenRouter
 */

const DEFAULT_BASE = "https://openrouter.ai/api/v1/chat/completions";
/** Slug на OpenRouter (обновляйте при смене каталога): см. https://openrouter.ai/qwen */
const DEFAULT_MODEL = "qwen/qwen-2.5-7b-instruct";
/** Мультимодальная модель для проверки сканов (OpenRouter). */
const DEFAULT_VISION_MODEL = "qwen/qwen2.5-vl-32b-instruct";

function getApiKey(): string {
  return (
    (import.meta.env.VITE_API_KEY as string | undefined) ||
    (import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined) ||
    ""
  );
}

function getEndpoint(): string {
  return (import.meta.env.VITE_AI_BASE_URL as string | undefined) || DEFAULT_BASE;
}

function getModel(): string {
  return (import.meta.env.VITE_AI_MODEL as string | undefined) || DEFAULT_MODEL;
}

function getVisionModel(): string {
  return (import.meta.env.VITE_AI_VISION_MODEL as string | undefined) || DEFAULT_VISION_MODEL;
}

export class AiProviderError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | unknown } }>;
  error?: { message?: string };
};

/**
 * Базовый запрос к модели Qwen 2.5 (через совместимый Chat Completions API).
 */
function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function askQwenViaProxy(userPrompt: string, systemPrompt: string): Promise<string> {
  const res = await fetch(apiUrl("/api/ai/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userPrompt, systemPrompt }),
  });
  const data = (await res.json()) as { text?: string; error?: string };
  if (!res.ok) {
    throw new AiProviderError(data.error || res.statusText || "Ошибка прокси ИИ", res.status);
  }
  const text = data.text?.trim();
  if (!text) {
    throw new AiProviderError("Пустой ответ прокси ИИ");
  }
  return text;
}

export type QwenChatTurn = { role: "user" | "assistant"; content: string };

async function askQwenMessagesViaProxy(systemPrompt: string, turns: QwenChatTurn[]): Promise<string> {
  const res = await fetch(apiUrl("/api/ai/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt, messages: turns }),
  });
  const data = (await res.json()) as { text?: string; error?: string };
  if (!res.ok) {
    throw new AiProviderError(data.error || res.statusText || "Ошибка прокси ИИ", res.status);
  }
  const text = data.text?.trim();
  if (!text) {
    throw new AiProviderError("Пустой ответ прокси ИИ");
  }
  return text;
}

export async function askQwen(userPrompt: string, systemPrompt: string): Promise<string> {
  if (import.meta.env.VITE_USE_AI_PROXY === "true") {
    return askQwenViaProxy(userPrompt, systemPrompt);
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new AiProviderError(
      "Не задан API-ключ. Укажите VITE_API_KEY в `.env.local` (dev) или в переменных окружения хостинга (production) и пересоберите приложение."
    );
  }

  const url = getEndpoint();
  const model = getModel();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(url.includes("openrouter.ai") && {
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://localhost",
        "X-Title": "Smart University Profile",
      }),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.45,
      max_tokens: 600,
    }),
  });

  const data = (await res.json()) as ChatCompletionResponse;

  if (!res.ok) {
    const msg = data.error?.message || res.statusText || "Ошибка API";
    throw new AiProviderError(msg, res.status);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new AiProviderError("Пустой ответ модели");
  }

  return text;
}

/**
 * Многоходовый диалог с Qwen (тот же endpoint, что и `askQwen`, но с историей реплик).
 */
export async function askQwenMessages(systemPrompt: string, turns: QwenChatTurn[]): Promise<string> {
  if (!turns.length) {
    throw new AiProviderError("Пустая история диалога");
  }

  if (import.meta.env.VITE_USE_AI_PROXY === "true") {
    return askQwenMessagesViaProxy(systemPrompt, turns);
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new AiProviderError(
      "Не задан API-ключ. Укажите VITE_API_KEY в `.env.local` (dev) или в переменных окружения хостинга (production) и пересоберите приложение."
    );
  }

  const url = getEndpoint();
  const model = getModel();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(url.includes("openrouter.ai") && {
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://localhost",
        "X-Title": "Smart University Profile",
      }),
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...turns],
      temperature: 0.45,
      max_tokens: 900,
    }),
  });

  const data = (await res.json()) as ChatCompletionResponse;

  if (!res.ok) {
    const msg = data.error?.message || res.statusText || "Ошибка API";
    throw new AiProviderError(msg, res.status);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new AiProviderError("Пустой ответ модели");
  }

  return text;
}

/**
 * Проверка изображения сертификата/грамоты через vision-модель (Qwen VL на OpenRouter).
 * `dataUrl` — data:image/png;base64,...
 */
export async function verifyAchievementCertificateImage(
  dataUrl: string,
  category: "olympiad" | "other"
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new AiProviderError(
      "Не задан API-ключ. Укажите VITE_API_KEY в `.env.local` или в env деплоя и пересоберите приложение."
    );
  }

  const url = getEndpoint();
  const model = getVisionModel();

  const contextHint =
    category === "olympiad"
      ? "Пользователь заявляет участие/победу в олимпиаде или предметной олимпиаде."
      : "Пользователь загрузил документ о достижении (конкурс, грамота и т.п.).";

  const instruction = `Ты эксперт приёмной комиссии QApp. Изучи изображение (скан или фото документа).
${contextHint}
Оцени, выглядит ли это как подлинный или правдоподобный сертификат/диплом/грамота с текстом (не пустой лист, не случайное фото).
Ответь по-русски: 2–4 коротких предложения с обоснованием.
На отдельной последней строке строго напиши одно из двух (латиницей, большими буквами):
VERDICT: ACCEPT — если документ похож на реальный сертификат награды/олимпиады.
VERDICT: REJECT — если изображение не по теме, пустое, явно не документ или явная подделка/нечитаемо.`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(url.includes("openrouter.ai") && {
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://localhost",
        "X-Title": "Smart University Profile — certificate check",
      }),
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: instruction },
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      temperature: 0.25,
      max_tokens: 900,
    }),
  });

  const data = (await res.json()) as ChatCompletionResponse;

  if (!res.ok) {
    const msg = data.error?.message || res.statusText || "Ошибка API vision";
    throw new AiProviderError(msg, res.status);
  }

  const raw = data.choices?.[0]?.message?.content;
  const text =
    typeof raw === "string"
      ? raw.trim()
      : Array.isArray(raw)
        ? raw
            .map((p: { text?: string }) => (typeof p === "object" && p && "text" in p ? String(p.text) : ""))
            .join("")
            .trim()
        : "";
  if (!text) {
    throw new AiProviderError("Пустой ответ vision-модели");
  }

  return text;
}

export function isAiConfigured(): boolean {
  if (import.meta.env.VITE_USE_AI_PROXY === "true") {
    return true;
  }
  return Boolean(getApiKey());
}
