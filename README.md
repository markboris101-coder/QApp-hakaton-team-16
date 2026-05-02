# Smart University Profile · QApp MVP

**Хакатон QApp · команда 16** — интерактивная карточка абитуриента для вузов Казахстана: каталог вузов и программ (мок), AI Fit, чек-лист документов, дедлайны, стипендии, чат и обзоры на базе **Qwen** (OpenRouter). Опционально **Express API** для сохранения профиля и прокси ИИ в проде.

Репозиторий: [github.com/markboris101-coder/QApp-hakaton-team-16](https://github.com/markboris101-coder/QApp-hakaton-team-16)

## Возможности (кратко)

- **Дашборд вуза** — hero, sticky sidebar, AI Fit, программы с фильтрами, сравнение в каталоге, избранное.
- **Анкета на лендинге** — GPA, IELTS, SAT/UNT, город, финансирование, интересы; опционально **текст о достижениях** (олимпиады, спорт и т.д.) с разбором в числовые уровни через **Qwen** (или эвристика без ключа API).
- **Профиль** — редактирование данных, чекбоксы наград, загрузка PNG сертификатов с проверкой **Qwen VL**, повторный разбор текстового блока достижений.
- **Локализация UI** — **қазақша / русский / English** (`i18next`), выбор языка в шапке, сохранение в `localStorage` (`qapp-locale`).
- **Персонализация** — `calculateFitScore` с учётом профиля, достижений (в т.ч. верифицированная олимпиада по PNG), рекомендации вузов.

## Соответствие требованиям MVP / scope QApp

Ниже — трассировка к обязательному функционалу прототипа (дашборд, Fit, программы, документы, стипендии, ИИ, профиль). Дополнительно отмечены реализованные улучшения сверх базового списка.

| Требование | Реализация |
|------------|------------|
| Адаптивный профиль / дашборд | ✅ Tailwind, breakpoints `sm` / `lg` |
| Hero: вуз, город, визуал, бейджи, CTA | ✅ + переключатель вуза и каталог |
| AI Fit / Your Match | ✅ `AiFitCard`, обзор Qwen по запросу |
| Программы: поиск и фильтры | ✅ `ProgramGrid`, локализованные подписи |
| Admission checklist + прогресс | ✅ `AdmissionChecklist`; перечень документов согласован с ключами ТЗ (`documentLabels` / `StudentDocuments`) |
| Deadlines timeline | ✅ `DeadlinesTimeline` |
| Scholarships + AI | ✅ `ScholarshipsSection`, персональный текст по кнопке |
| Sticky sidebar (desktop) | ✅ `DashboardStickySidebar` |
| Профиль студента | ✅ `/profile`, mock + **IndexedDB** + опционально sync **`PUT /api/profile`** |
| Персонализация | ✅ `calculateFitScore`, `getUniversityRecommendations`, промпты с данными профиля |
| Backend (опционально по ТЗ) | ✅ Express: профиль, университеты, **`/api/ai/chat`** (прокси Qwen) |
| **Локализация (kk / ru / en)** | ✅ `src/i18n/config.ts`, `src/locales/*.json`, `LanguageSwitcher` |
| **Достижения в анкете + разбор Qwen** | ✅ свободный текст → уровни олимпиада / спорт / прочие (`parseAchievementNarrative`), влияние на Fit |

Секреты в git не попадают: `.env.local`, `.env.server` в `.gitignore`. Шаблоны переменных — **`.env.example`**, **`env.example`**.

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | React 18, Vite 5, React Router, Tailwind, Framer Motion |
| i18n | `i18next`, `react-i18next` |
| ИИ | OpenAI-совместимый Chat API (по умолчанию OpenRouter + Qwen 2.5 / Qwen2.5-VL для vision) |
| Хранение | `localStorage`, IndexedDB (`documentStorage`), опционально серверный JSON профиля |

## Быстрый старт (только фронт)

```bash
npm install
```

Скопируйте `.env.example` в `.env.local` и при необходимости укажите **`VITE_API_KEY`** (OpenRouter), если ИИ вызывается **из браузера** (чат, разбор достижений, vision для PNG).

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

## Переменные окружения (фронт)

| Переменная | Назначение |
|------------|------------|
| `VITE_API_KEY` | Прямой вызов OpenRouter из браузера; также нужен для **vision** (проверка PNG), если не используете прокси |
| `VITE_OPENROUTER_API_KEY` | Альтернативное имя ключа |
| `VITE_AI_BASE_URL` | Кастомный endpoint Chat Completions |
| `VITE_AI_MODEL` | Текстовая модель (по умолчанию Qwen 2.5 instruct) |
| `VITE_AI_VISION_MODEL` | Модель для разбора изображений сертификатов |
| `VITE_API_BASE_URL` | URL бэкенда **без** слэша в конце (прод: синхронизация профиля и `/api/*`) |
| `VITE_USE_AI_PROXY` | `true` — вызовы Qwen через **`POST /api/ai/chat`**, секрет только на сервере |

Подробный деплой: **[`DEPLOY.md`](./DEPLOY.md)**.

| Платформа | Конфиг |
|-----------|--------|
| Vercel | [`vercel.json`](./vercel.json) |
| Netlify | [`netlify.toml`](./netlify.toml), [`public/_redirects`](./public/_redirects) |

Проверка API: `GET /api/health` (корень API без HTML — ожидаемо).

## Локализация

- Файлы переводов: `src/locales/en.json`, `ru.json`, `kk.json`.
- Язык по умолчанию: из браузера / **`qapp-locale`** в `localStorage`; fallback **`ru`**.
- Компонент переключателя: `src/components/LanguageSwitcher.tsx`.

## Достижения и AI Fit

- Пользователь вводит **свободный текст** (олимпиады, спорт, волонтёрство и т.д.) в анкете или в профиле.
- Кнопка **«Оценить с Qwen»** (или автоматический разбор при сохранении анкеты) переводит текст в уровни **`AchievementProfile`** (`olympiadTier`, `sportsTier`, `otherMerit`).
- Без API-ключа включается **эвристика по ключевым словам** (kk/ru/en).
- Загрузка **PNG** олимпиады + вердикт **Qwen VL** повышает доверие к олимпиадному бону в **`calculateFitScore`** (см. `src/calculateFitScore.ts`).

Логика разбора: `src/lib/parseAchievementNarrative.ts`, UI-блок: `src/components/AchievementNarrativeBlock.tsx`.

## Структура репозитория

| Путь | Описание |
|------|----------|
| `src/` | React-приложение, маршруты `/`, `/program/:id`, `/profile`, … |
| `src/i18n/` | Инициализация i18next |
| `src/locales/` | Строки интерфейса (en / ru / kk) |
| `src/mockData.ts` | Мок вузов и программ (SSOT для фронта; сервер может импортировать те же данные) |
| `server/` | Express: `/api/profile`, `/api/universities`, `/api/ai/chat`, … |

---

**Smart University Profile** — прототип для демонстрации UX и интеграции LLM; данные вузов и контракты учебные **демонстрационные**, не официальные прайсы или правила приёма.
