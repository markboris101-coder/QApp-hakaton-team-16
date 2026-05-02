import { useCallback } from "react";
import { useProfile } from "../context/ProfileContext";
import { askQwen, askQwenMessages, type QwenChatTurn } from "../services/aiProvider";
import { getProgramBySlug } from "../mockData";
import type { StudentProfile } from "../mockData";

/**
 * Системный промпт для всех сценариев QApp.
 * Явно снимаем «смещение к NU»: модели часто перетягивают ответы к Nazarbayev University без оснований.
 */
export const ADVISOR_SYSTEM_PROMPT = `Ты — эксперт QApp по поступлению в вузы Казахстана (полный каталог в приложении — десятки вузов).

Правила контекста:
- Не предполагай по умолчанию, что абитуриент целится в Nazarbayev University (NU). Упоминай NU только если пользователь или контекст явно называют этот вуз.
- Если в запросе указан другой вуз (название, город, id) — отвечай про него; не подменяй ответ советами «как в NU».
- Общие вопросы (документы, ЕНТ, сроки) давай нейтрально по системе приёма в РК, без фокуса на одном вузе.

Ориентируйся на типичную практику приёма, ЕНТ/UNT и международные экзамены. Тон: профессиональный, лаконичный. Русский язык.`;

function summarizeStudentBlock(student: StudentProfile): string {
  const a = student.academic;
  return [
    `Страна: ${a.country}`,
    `GPA: ${a.gpa}/5.0, IELTS: ${a.ielts}, SAT: ${a.sat > 0 ? a.sat : "не указан"}, UNT/ЕНТ: ${a.untScore}/140`,
    `Интересы: ${student.preferences.interests.join(", ") || "—"}`,
    `Финансирование: ${student.preferences.financialStatus}`,
    `Награды: ${student.awards.length ? student.awards.join(", ") : "нет"}`,
    `Олимпиада подтверждена сертификатом (AI): ${student.olympiadVerified ? "да" : "нет"}`,
  ].join("\n");
}

export function useSmartAdvisor() {
  const { student, universityData, universities, selectedUniversityId, favoriteUniversityIds } = useProfile();

  const getProgramAdvice = useCallback(
    async (programId: string): Promise<string> => {
      const found = getProgramBySlug(programId);
      if (!found) {
        throw new Error("Программа не найдена");
      }
      const { program, university } = found;
      const satLine =
        student.academic.sat > 0
          ? `SAT ${student.academic.sat} и `
          : "";
      const prompt = `Программа «${program.name}» в вузе «${university.name}» (${university.city}; поле: ${program.field}). Все рекомендации — только для этого вуза; не переноси требования Nazarbayev University сюда без нужды.

Проанализируй ${satLine}ЕНТ ${student.academic.untScore} для этой программы (в РК SAT часто не указывают — не требуй его, если в профиле нет). Дай совет из 2 предложений. Учти GPA ${student.academic.gpa.toFixed(1)} и IELTS ${student.academic.ielts.toFixed(1)}.`;
      return askQwen(prompt, ADVISOR_SYSTEM_PROMPT);
    },
    [student]
  );

  const getGeneralFitAdvice = useCallback(async (): Promise<string> => {
    const prompt = `Оценка только для вуза «${universityData.name}» (${universityData.city}), id=${universityData.id}. Не переключайся на Nazarbayev University, если это другой вуз.

Дай общую оценку шансов поступления именно туда для абитуриента:

${summarizeStudentBlock(student)}

Средний AI Fit по программам можно упомянуть контекстно, но не выдумывай точные цифры приёмной комиссии. Сформулируй краткий executive summary на 3–4 предложения: сильные стороны, риски, следующий шаг.`;

    return askQwen(prompt, ADVISOR_SYSTEM_PROMPT);
  }, [student, universityData]);

  const getScholarshipAdvice = useCallback(
    async (scholarshipName: string): Promise<string> => {
      const s = universityData.scholarships.find((x) => x.name === scholarshipName);
      const reqText = s?.requirements ?? "";
      const prompt = `Стипендия «${scholarshipName}» в вузе «${universityData.name}» (${universityData.city}). Не относись к ней как к стипендии NU, если это другой вуз.

Объясни, как награда «Olympiad Winner» (олимпиада) может усилить заявку на эту стипендию.

Требования стипендии (справочно): ${reqText.slice(0, 800)}

Профиль абитуриента:
${summarizeStudentBlock(student)}

Ответ: 2–3 предложения, конкретно про связь олимпиады с этой стипендией в ЭТОМ вузе.`;

      return askQwen(prompt, ADVISOR_SYSTEM_PROMPT);
    },
    [student, universityData]
  );

  /** Свободный чат с Qwen: `priorTurns` — уже состоявшийся диалог (без нового сообщения). */
  const sendAdmissionChat = useCallback(
    async (priorTurns: QwenChatTurn[], newUserMessage: string): Promise<string> => {
      const favLine =
        favoriteUniversityIds.length > 0
          ? favoriteUniversityIds
              .map((id) => universities.find((u) => u.id === id))
              .filter(Boolean)
              .map((u) => `«${u!.name}»`)
              .join(", ")
          : "не отмечены";

      const context = `ТЕКУЩИЙ ВЫБОР В ИНТЕРФЕЙСЕ (дашборд QApp): id=${selectedUniversityId}, вуз «${universityData.name}», ${universityData.city}.
Это переключатель «активного вуза» для карточек на сайте — НЕ утверждение, что пользователь подаёт документы только сюда. В каталоге QApp сейчас ${universities.length} вузов Казахстана; абитуриент может подавать в несколько.

Важно: не отвечай так, будто заявка только в Nazarbayev University, если в строке выше другой вуз. По общим вопросам (ЕНТ, портал, документы) будь нейтрален к конкретному вузу.

Избранные вузы в приложении: ${favLine}.

Языки обучения у выбранного для дашборда вуза: ${universityData.languagesOfInstruction.join(", ")}.

Профиль абитуриента:
${summarizeStudentBlock(student)}`;

      const system = `${ADVISOR_SYSTEM_PROMPT}

Ты в режиме чата на сайте QApp. Отвечай по-русски, структурировано, без выдуманных точных порогов баллов — ориентиры и что уточнить на сайте нужного вуза.

Контекст:
${context}`;

      const turns: QwenChatTurn[] = [...priorTurns, { role: "user", content: newUserMessage }];
      return askQwenMessages(system, turns);
    },
    [student, universityData, universities, selectedUniversityId, favoriteUniversityIds]
  );

  return {
    getProgramAdvice,
    getGeneralFitAdvice,
    getScholarshipAdvice,
    sendAdmissionChat,
  };
}
