/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY?: string;
  readonly VITE_OPENROUTER_API_KEY?: string;
  readonly VITE_AI_BASE_URL?: string;
  readonly VITE_AI_MODEL?: string;
  /** Мультимодель для проверки PNG (OpenRouter), напр. qwen/qwen2.5-vl-32b-instruct */
  readonly VITE_AI_VISION_MODEL?: string;
  /** Если true — текстовые запросы Qwen идут через POST /api/ai/chat (ключ только на сервере). */
  readonly VITE_USE_AI_PROXY?: string;
  /** Базовый URL Express API в проде, без слэша (напр. https://api-xxxx.onrender.com). Пусто = относительные /api. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
