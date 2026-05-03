import { useCallback } from "react";
import { useProfile } from "../context/ProfileContext";
import { askQwen, askQwenMessages, type QwenChatTurn } from "../services/aiProvider";
import { getFaculty, getProgramBySlug } from "../mockData";
import i18n from "../i18n/config";
import { getUniversityDisplayName } from "../lib/universityLabels";
import {
  buildAdvisorBaseSystemPrompt,
  buildScenarioAdvisorContext,
  computeAverageProgramFit,
  formatTopProgramsForAdvisor,
  summarizeStudentRich,
} from "../lib/advisorContext";
import { calculateFitScore } from "../calculateFitScore";

export function useSmartAdvisor() {
  const {
    student,
    universityData,
    universities,
    selectedUniversityId,
    favoriteUniversityIds,
    shortlist,
  } = useProfile();
  const lang = i18n.language;

  const getProgramAdvice = useCallback(
    async (programId: string): Promise<string> => {
      const found = getProgramBySlug(programId);
      if (!found) {
        throw new Error("Программа не найдена");
      }
      const { program, university } = found;
      const uniLabel = getUniversityDisplayName(university, lang);
      const fac = getFaculty(university, program.facultyId);
      const facultyLine = fac ? getFacultyDisplayNameSafe(fac, lang) : program.facultyId;
      const fit = calculateFitScore(student, program, university.admissionExpectations);
      const req = program.entryRequirements?.length
        ? program.entryRequirements.join("; ")
        : "см. общие требования вуза в данных MVP";

      const system = `${buildAdvisorBaseSystemPrompt(lang)}

Ты даёшь персональный разбор ОДНОЙ программы в контексте сохранённого профиля абитуриента. Опирайся только на переданные данные; не переноси требования других вузов.`;

      const prompt = `Вуз: «${uniLabel}» (${university.city}), id=${university.id}.
Факультет/школа: ${facultyLine}.

Программа: «${program.name}»
Поле: ${program.field}; степень: ${program.degree}; срок: ${program.durationYears} г.; язык программы: ${program.language}.
Ориентировочная стоимость в mock-данных: ${program.annualTuitionKzt} ₸/год (не официальный прайс).

Расчётный AI Fit этой программы для профиля ниже: ${fit.score}%${fit.englishWarning ? `. Внимание по английскому: ${fit.englishWarning}` : ""}.

Mock «почему подходит» в данных: ${program.matchReason}

Вступительные требования в карточке (демо): ${req}

Профиль абитуриента:
${summarizeStudentRich(student, lang)}

Задача: 4–6 предложений на языке, заданном системным промптом — конкурентность именно этой программы, главный риск (балл/язык/документы), один конкретный следующий шаг (что проверить на сайте вуза или в чек-листе).`;

      return askQwen(prompt, system);
    },
    [student, lang]
  );

  const getGeneralFitAdvice = useCallback(async (): Promise<string> => {
    const un = getUniversityDisplayName(universityData, lang);
    const avg = computeAverageProgramFit(student, universityData);
    const system = `${buildAdvisorBaseSystemPrompt(lang)}

Ты пишешь executive summary для блока AI Fit на дашборде. Используй только переданный контекст; не придумывай официальные квоты и лимиты.`;

    const prompt = `Вуз дашборда: «${un}» (${universityData.city}), id=${universityData.id}.

Уже посчитано прототипом: средний fit по программам вуза ≈ ${avg}%.

Топ-3 программы по fit для этого профиля:
${formatTopProgramsForAdvisor(student, universityData, lang, 3)}

Полный профиль и документы:
${summarizeStudentRich(student, lang)}

Шорт-лист программ пользователя в этом вузе: ${
      shortlist.length
        ? shortlist
            .map((id) => {
              const p = universityData.programs.find((x) => x.id === id);
              return p ? p.name : id;
            })
            .join(", ")
        : "пока пуст"
    }

Напиши связный обзор на 4–7 предложений: общая картина по этому вузу для этого человека, сильные стороны, 2–3 явных риска или пробела, приоритетный следующий шаг до дедлайна ${universityData.applicationDeadline}.`;

    return askQwen(prompt, system);
  }, [student, universityData, shortlist, lang]);

  const getScholarshipAdvice = useCallback(
    async (scholarshipName: string): Promise<string> => {
      const s = universityData.scholarships.find((x) => x.name === scholarshipName);
      const reqText = s?.requirements ?? "";
      const un = getUniversityDisplayName(universityData, lang);
      const system = `${buildAdvisorBaseSystemPrompt(lang)}

Ты объясняешь релевантность конкретной стипендии для профиля абитуриента в ЭТОМ вузе.`;

      const prompt = `Вуз: «${un}» (${universityData.city}), id=${universityData.id}.
Дедлайн заявок в mock: ${universityData.applicationDeadline}.

Стипендия: «${scholarshipName}»
Описание/требования в данных: ${reqText.slice(0, 900)}

Профиль и документы:
${summarizeStudentRich(student, lang)}

Ответ: 3–5 предложений — насколько реалистично при текущем профиле, что усилит заявку, что проверить официально на сайте вуза. Свяжи с олимпиадами/меритом только если это уместно по тексту стипендии и профилю.`;

      return askQwen(prompt, system);
    },
    [student, universityData, lang]
  );

  const sendAdmissionChat = useCallback(
    async (priorTurns: QwenChatTurn[], newUserMessage: string): Promise<string> => {
      const scenario = buildScenarioAdvisorContext({
        student,
        universityData,
        universities,
        selectedUniversityId,
        favoriteUniversityIds,
        shortlist,
        lang,
      });

      const system = `${buildAdvisorBaseSystemPrompt(lang)}

Ты в режиме живого чата QApp. Отвечай опираясь на блок «Сценарный контекст» — это актуальное состояние интерфейса и профиля пользователя. Если вопрос общий про систему приёма в РК, можно опираться на общие знания, но не противоречь переданным данным профиля.
Если пользователь спрашивает про другой вуз из списка избранного — учитывай его название из контекста.

Сценарный контекст (обновляется при каждом сообщении):
${scenario}`;

      const turns: QwenChatTurn[] = [...priorTurns, { role: "user", content: newUserMessage }];
      return askQwenMessages(system, turns);
    },
    [student, universityData, universities, selectedUniversityId, favoriteUniversityIds, shortlist, lang]
  );

  return {
    getProgramAdvice,
    getGeneralFitAdvice,
    getScholarshipAdvice,
    sendAdmissionChat,
  };
}

function getFacultyDisplayNameSafe(
  fac: { name: string; nameRu?: string; nameKk?: string },
  lang: string
): string {
  if (lang.startsWith("kk") && fac.nameKk) return fac.nameKk;
  if (lang.startsWith("ru") && fac.nameRu) return fac.nameRu;
  return fac.name;
}
