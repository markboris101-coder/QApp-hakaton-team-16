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
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

/**
 * Базовый запрос к модели Qwen 2.5 (через совместимый Chat Completions API).
 */
export async function askQwen(userPrompt: string, systemPrompt: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new AiProviderError(
      "Не задан API-ключ. Добавьте VITE_API_KEY в .env.local и перезапустите dev-сервер."
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

export function isAiConfigured(): boolean {
  return Boolean(getApiKey());
}
