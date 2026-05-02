# Smart University Profile · QApp MVP

Умная студенческая карточка для QApp: несколько вузов Казахстана (мок), подбор программ, дедлайны, чек-лист документов, стипендии и советы Qwen (OpenRouter). Express API для профиля и прокси ИИ — опционально в проде.

## Быстрый старт (только фронт)

```bash
npm install
```

Скопируйте `.env.example` в `.env.local` и укажите `VITE_API_KEY` (OpenRouter), если вызываете ИИ **из браузера**.

```bash
npm run dev
```

Откройте `http://localhost:5173`.

### Фронт + API локально

В одном терминале:

```bash
npm run dev:full
```

Или два процесса: `npm run dev:server` (порт **8787**) и `npm run dev` (Vite проксирует `/api` на бэкенд).

## Сборка

```bash
npm run build
npm run preview
```

## Продакшен: фронт + бэкенд

Кратко:

1. **Web Service (Render / Railway и т.д.)** — тот же репозиторий, **Start:** `npm run start:server`, на сервере `API_KEY` = OpenRouter.
2. **Статика (Vercel / Netlify / Render Static Site)** — `npm run build`, папка **`dist`**.

На фронте в переменных сборки:

| Переменная | Назначение |
|------------|------------|
| `VITE_API_BASE_URL` | URL API **без** слэша в конце, напр. `https://qapp-hakaton-team-16.onrender.com` |
| `VITE_USE_AI_PROXY` | `true` — текстовый Qwen через `POST /api/ai/chat`, ключ только на сервере |
| `VITE_API_KEY` | Прямой вызов OpenRouter из браузера **или** проверка PNG (vision), если не через прокси |

Подробные шаги: **[`DEPLOY.md`](./DEPLOY.md)**.

| Платформа | Файл |
|-----------|------|
| Vercel | [`vercel.json`](./vercel.json) — SPA fallback для React Router |
| Netlify | [`netlify.toml`](./netlify.toml), [`public/_redirects`](./public/_redirects) |

Корень **`/`** у API не отдаёт HTML — это норма; проверка: `GET /api/health`.

## Структура

| Путь | Описание |
|------|----------|
| `src/` | React (Vite), маршруты `/`, `/program/:id`, `/profile` |
| `server/` | Express: `/api/profile`, `/api/universities`, `/api/ai/chat`, … |
| `src/mockData.ts` | Мок вузов и программ (SSOT для фронта; сервер импортирует те же данные) |

## Соответствие MVP (обязательный scope)

| Требование | Статус |
|------------|--------|
| Responsive профиль / дашборд | ✅ Tailwind (`sm` / `lg`) |
| Hero: вуз, город, фон, бейджи, CTA | ✅ + выбор вуза |
| AI Fit / Your Match | ✅ `AiFitCard`, обзор Qwen по кнопке |
| Программы: поиск и фильтры | ✅ `ProgramGrid` |
| Admission checklist + прогресс | ✅ `AdmissionChecklist` |
| Deadlines timeline | ✅ `DeadlinesTimeline` |
| Scholarships + AI | ✅ `ScholarshipsSection`, разбор по кнопке |
| Sticky sidebar (desktop) | ✅ `DashboardStickySidebar` |
| Профиль студента | ✅ `/profile`, mock + IndexedDB + опционально API |
| Персонализация | ✅ `calculateFitScore`, промпты с данными студента |
| Backend (опционально по ТЗ) | ✅ Express + файл профиля + прокси ИИ |

Секреты не коммитьте: `.env.local`, `.env.server` в `.gitignore`. Образцы переменных — **`.env.example`**, **`env.example`**.
