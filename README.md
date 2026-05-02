# Smart University Profile · QApp MVP

Умная студенческая карточка для QApp: подбор программ, дедлайны, чек-лист документов и советы от модели (OpenRouter / Qwen).

## Публичный деплой (ссылка для всех)

Подойдёт любой статический хостинг для Vite (`dist/`). Рекомендуется **Vercel** или **Netlify** — в репозитории уже есть конфиги:

| Платформа | Файл | Назначение |
|-----------|------|------------|
| **Vercel** | [`vercel.json`](./vercel.json) | SPA fallback: все пути → `index.html` (нужно для `/program/:id`) |
| **Netlify** | [`netlify.toml`](./netlify.toml), [`public/_redirects`](./public/_redirects) | То же для Netlify |

### Vercel (кратко)

1. Зайдите на [vercel.com](https://vercel.com), **Import** репозитория GitHub `QApp-hakaton-team-16`.
2. Framework: **Vite** (или Other), Build: `npm run build`, Output: `dist`.
3. В **Settings → Environment Variables** добавьте для **Production** (и при желании Preview):
   - `VITE_API_KEY` = ваш ключ OpenRouter (см. ниже про ИИ).
4. **Redeploy** после добавления переменных.

Публичная ссылка вида `https://….vercel.app` появится после первого успешного деплоя.

### ИИ-ассистент на продакшене

Запросы к модели идут **из браузера** напрямую в OpenRouter (`fetch` в [`src/services/aiProvider.ts`](./src/services/aiProvider.ts)).

- **Чтобы ИИ работал на задеплоенном сайте**, при сборке должен быть задан **`VITE_API_KEY`** в переменных окружения хостинга (как выше). Vite подставляет `import.meta.env.VITE_*` на этапе **build** — после изменения ключа нужен **новый деплой**.
- **Важно:** ключ попадает в клиентский JS-бандл (это норма для фронт-only MVP; для продакшена «по уму» нужен backend-прокси — см. опциональные пункты ТЗ).

Локально ключ храните только в **`.env.local`** (файл в `.gitignore`, в Git не попадает).

## Интерфейс

Скриншот собран из production preview (`npm run preview`) — соответствует виду после `npm run dev`.

![Интерфейс приложения — главная страница](./docs/ui-preview.png)

## Запуск локально

```bash
npm install
```

Создайте `.env.local` по образцу [`.env.example`](./.env.example) и укажите `VITE_API_KEY`.

```bash
npm run dev
```

Откройте адрес из терминала (обычно `http://localhost:5173`).

## Сборка

```bash
npm run build
npm run preview
```

---

## Соответствие MVP (обязательный scope)

| Требование | Статус |
|------------|--------|
| Responsive university profile (desktop + mobile) | ✅ Tailwind breakpoints (`sm`, `lg`), адаптивная сетка |
| Hero: название, город, фото/фон, badges, CTA | ✅ Фон campus (Unsplash) + градиент, badges, **Edit profile** + **Browse programs** |
| Блок AI Fit / Your Match | ✅ Кольцо AI fit, блок «Why you match», секция `AiFitCard` |
| Список программ с поиском и фильтрами | ✅ `ProgramGrid` |
| Admission checklist + прогресс | ✅ `AdmissionChecklist` |
| Deadlines timeline | ✅ `DeadlinesTimeline` |
| Scholarships + AI-инсайт | ✅ `ScholarshipsSection` |
| Sticky sidebar на desktop | ✅ `StudentQuickSidebar` на главной и странице программы (`lg:sticky`) |
| Профиль студента (mock) | ✅ `mockData` + `ProfileContext`, редактор профиля |
| Персонализация по профилю | ✅ `calculateFitScore`, ИИ-промпты с данными студента |
| Clean modern UI (QApp-стиль) | ✅ Tailwind, карточки, типографика |

Опциональные пункты ТЗ (backend, серверное хранилище, БД по Казахстану, отдельный AI backend, авторизация) в текущей версии **не реализованы** — только клиент и mock-данные.
