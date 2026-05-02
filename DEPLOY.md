# Деплой (GitHub + хостинг)

## 1. Залить код на GitHub

Если репозиторий уже есть (`git remote -v` показывает `github.com`):

```bash
git add -A
git status
git commit -m "feat: backend API, multi-university UI, deploy config"
git push origin main
```

Если репозитория ещё нет — создайте пустой репозиторий на GitHub (без README), затем:

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Аутентификация: **Personal Access Token** (classic) с правом `repo`, или GitHub CLI `gh auth login`.

---

## 2. Фронтенд (статика)

Подходит **Vercel** или **Netlify**: подключите репозиторий, ветка `main`.

| Настройка | Значение |
|-----------|----------|
| Build command | `npm run build` |
| Output / Publish | `dist` |

В **Environment Variables** добавьте на сборку (префикс `VITE_` попадает в клиент):

- `VITE_API_KEY` — если ИИ из браузера (без прокси).
- Или `VITE_USE_AI_PROXY=true` + **`VITE_API_BASE_URL`** = URL вашего API (см. ниже), ключ только на сервере (`API_KEY`).

После изменения env — **пересоберите деплой**.

В корне уже есть **`vercel.json`** (SPA fallback). Для Netlify используется **`public/_redirects`**.

---

## 3. Бэкенд (Express)

Подходит **Render**, **Railway**, **Fly.io**: тип **Web Service**, runtime **Node 20+**.

| Поле | Значение |
|------|----------|
| Start command | `npm run start:server` |
| Build (опционально) | `npm ci` |

Переменные окружения:

| Переменная | Описание |
|------------|----------|
| `PORT` | Обычно задаёт платформа автоматически |
| `API_KEY` или `OPENROUTER_API_KEY` | Для `POST /api/ai/chat` |
| `CORS_ORIGIN` | Полный URL фронта, например `https://your-app.vercel.app` (без слэша в конце). Несколько через запятую. |

Если **`CORS_ORIGIN` не задан**, сервер разрешает localhost и типичные `*.vercel.app` / `*.netlify.app`.

---

## 4. Связать фронт и API

В переменных **фронта** укажите:

```text
VITE_API_BASE_URL=https://your-service.onrender.com
```

Без слэша в конце. Тогда запросы пойдут на ваш Render/Railway URL.

Локально прокси Vite (`/api` → `8787`) в проде не используется — нужен именно **`VITE_API_BASE_URL`**.

---

## Безопасность

Не коммитьте `.env.local`, `.env.server`, ключи API. В репозитории остаются только **`env.example`** и **`.env.example`**.
