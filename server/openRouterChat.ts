/**
 * Один запрос к OpenAI-compatible Chat Completions (OpenRouter).
 * Ключ только на сервере: API_KEY или OPENROUTER_API_KEY.
 */

const DEFAULT_BASE = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "qwen/qwen-2.5-7b-instruct";

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | unknown } }>;
  error?: { message?: string };
};

function getApiKey(): string {
  return process.env.API_KEY || process.env.OPENROUTER_API_KEY || "";
}

function getEndpoint(): string {
  return process.env.AI_BASE_URL || DEFAULT_BASE;
}

function getModel(): string {
  return process.env.AI_MODEL || DEFAULT_MODEL;
}

export function isAiConfigured(): boolean {
  return Boolean(getApiKey());
}

export async function completeChat(userPrompt: string, systemPrompt: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("На сервере не задан API_KEY или OPENROUTER_API_KEY.");
  }

  const url = getEndpoint();
  const model = getModel();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(url.includes("openrouter.ai") && {
        "HTTP-Referer": process.env.PUBLIC_APP_URL || "http://localhost:5173",
        "X-Title": "Smart University Profile (API)",
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
    throw new Error(msg);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text || typeof text !== "string") {
    throw new Error("Пустой ответ модели");
  }

  return text;
}
