import type { StudentProfile, UniversityTemplate } from "../mockData";
import { formatTuitionBand } from "../mockData";
import { calculateFitScore } from "../calculateFitScore";
import { DOCUMENT_ENTRIES } from "../components/documentLabels";
import { getUniversityDisplayName } from "./universityLabels";

/** Язык ответа модели под локаль интерфейса */
export function advisorResponseLanguageRule(lang: string): string {
  if (lang.startsWith("kk")) {
    return "Жауапты негізінен қазақ тілінде жаз; қажет болса орыс немесе ағылшын терминдерін қалдыра бер.";
  }
  if (lang.startsWith("en")) {
    return "Reply mainly in English; keep Kazakh/Russian proper names for universities and programs.";
  }
  return "Отвечай на русском языке; названия вузов и программ можно оставлять в оригинале.";
}

/** Базовые правила советника + язык ответа */
export function buildAdvisorBaseSystemPrompt(lang: string): string {
  return `Ты — эксперт QApp по поступлению в вузы Казахстана (в каталоге QApp — множество вузов с разными городами и типами).

Правила контекста:
- Не предполагай по умолчанию, что абитуриент целится в Nazarbayev University (NU). Упоминай NU только если пользователь или данные ниже явно указывают этот вуз.
- Если указан другой вуз (название, город, id) — отвечай про него; не подменяй советами «как в NU».
- Не выдумывай точные пороги баллов приёмной комиссии года — используй только переданные ниже данные профиля и ориентиры вуза из контекста; при нехватке данных предлагай проверить официальный сайт вуза.
- Тон: профессиональный, конкретный, без лишней воды.

${advisorResponseLanguageRule(lang)}`;
}

function docLabel(entry: (typeof DOCUMENT_ENTRIES)[number], lang: string): string {
  return lang.startsWith("kk") || lang.startsWith("ru") ? entry.labelRu : entry.label;
}

/** Документы, предпочтения, достижения — для всех сценариев ИИ */
export function summarizeStudentRich(student: StudentProfile, lang: string): string {
  const a = student.academic;
  const docs = DOCUMENT_ENTRIES.map((e) => `  · ${docLabel(e, lang)}: ${student.documents[e.key]}`).join("\n");
  const ach = student.achievementProfile;
  const achLine = ach
    ? [
        `структура достижений (эвристика/модель): олимп=${ach.olympiadTier}, спорт=${ach.sportsTier}, прочее=${ach.otherMerit}`,
        ach.modelSummary ? `краткое резюме: ${ach.modelSummary.slice(0, 400)}` : null,
        ach.parseFailed ? "разбор текста достижений: ошибка/эвристика" : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "нет структурированного блока достижений";

  return [
    `Класс / страна: ${a.grade}, ${a.country}`,
    `Академика: GPA ${a.gpa}/5.0; IELTS ${a.ielts}; SAT: ${a.sat > 0 ? a.sat : "не указан"}; UNT/ЕНТ ${a.untScore}/140`,
    `Интересы: ${student.preferences.interests.join(", ") || "—"}`,
    `Предпочитаемый язык обучения (профиль): ${student.preferences.language}`,
    `Город/регион цели: ${student.preferences.city || "—"}`,
    `Цель поступления: ${student.preferences.goal || "—"}`,
    `Финансирование: ${student.preferences.financialStatus}`,
    `Награды (строки): ${student.awards.length ? student.awards.join(", ") : "нет"}`,
    `Олимпиада подтверждена загрузкой сертификата: ${student.olympiadVerified ? "да" : "нет"}`,
    `Достижения:\n${achLine}`,
    `Документы в чек-листе MVP:\n${docs}`,
  ].join("\n");
}

export function computeAverageProgramFit(student: StudentProfile, university: UniversityTemplate): number {
  if (!university.programs.length) return 0;
  let sum = 0;
  for (const p of university.programs) {
    sum += calculateFitScore(student, p, university.admissionExpectations).score;
  }
  return Math.round(sum / university.programs.length);
}

export function formatTopProgramsForAdvisor(
  student: StudentProfile,
  university: UniversityTemplate,
  lang: string,
  topN = 5
): string {
  const rows = university.programs
    .map((p) => ({
      name: p.name,
      field: p.field,
      degree: p.degree,
      langP: p.language,
      score: calculateFitScore(student, p, university.admissionExpectations).score,
      reason: p.matchReason.slice(0, 280),
    }))
    .sort((x, y) => y.score - x.score)
    .slice(0, topN);

  return rows
    .map(
      (r, i) =>
        `${i + 1}. «${r.name}» (${r.field}, ${r.degree}, язык программы: ${r.langP}) — расчётный fit ${r.score}%. Кратко почему (mock): ${r.reason}`
    )
    .join("\n");
}

/** Расширенный блок для чата и executive summary */
export function buildScenarioAdvisorContext(opts: {
  student: StudentProfile;
  universityData: UniversityTemplate;
  universities: UniversityTemplate[];
  selectedUniversityId: string;
  favoriteUniversityIds: string[];
  shortlist: string[];
  lang: string;
}): string {
  const { student, universityData, universities, selectedUniversityId, favoriteUniversityIds, shortlist, lang } = opts;

  const uniName = getUniversityDisplayName(universityData, lang);
  const favNames = favoriteUniversityIds
    .map((id) => universities.find((u) => u.id === id))
    .filter(Boolean)
    .map((u) => `«${getUniversityDisplayName(u!, lang)}» (${u!.city})`)
    .join("; ") || "не отмечены";

  const shortlistLines = shortlist
    .map((id) => {
      const p = universityData.programs.find((x) => x.id === id);
      return p ? `«${p.name}» (${p.field})` : id;
    })
    .join("; ") || "пусто";

  const avgFit = computeAverageProgramFit(student, universityData);

  return [
    `=== ТЕКУЩИЙ ЭКРАН ДАШБОРДА QApp ===`,
    `Активный вуз (переключатель карточек): id=${selectedUniversityId}; «${uniName}»; ${universityData.city}`,
    `Тип вуза: ${universityData.type}; год основания: ${universityData.foundedYear}`,
    `Языки инструкции (вуз): ${universityData.languagesOfInstruction.join(", ")}`,
    `Дедлайн заявок (mock в данных): ${universityData.applicationDeadline}`,
    `Ориентир контракта: ${formatTuitionBand(universityData.tuitionOverview)}`,
    `Кратко о стипендиях в данных: ${universityData.scholarshipBlurb.slice(0, 500)}`,
    `Число программ в карточке вуза: ${universityData.programs.length}`,
    `Средний расчётный AI Fit по программам этого вуза при текущем профиле: ~${avgFit}% (внутренняя модель прототипа, не официальный балл приёма).`,
    ``,
    `Топ программ по расчётному fit для ЭТОГО вуза и профиля:`,
    formatTopProgramsForAdvisor(student, universityData, lang, 5),
    ``,
    `Шорт-лист программ пользователя (в рамках текущего вуза): ${shortlistLines}`,
    `Избранные вузы в каталоге: ${favNames}`,
    `Всего вузов в каталоге MVP: ${universities.length}`,
    ``,
    `=== ПРОФИЛЬ АБИТУРИЕНТА ===`,
    summarizeStudentRich(student, lang),
  ].join("\n");
}
