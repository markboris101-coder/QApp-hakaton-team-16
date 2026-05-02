import { useCallback } from "react";
import { useProfile } from "../context/ProfileContext";
import { askQwen } from "../services/aiProvider";
import { getProgramBySlug } from "../mockData";
import type { StudentProfile } from "../mockData";

/** Системный промпт для всех сценариев QApp */
export const ADVISOR_SYSTEM_PROMPT = `Ты — эксперт приёмной комиссии QApp. Твои советы базируются на правилах вузов Казахстана (NU, AITU, KBTU). Тон: профессиональный, лаконичный. Используй русский язык.`;

function summarizeStudentBlock(student: StudentProfile): string {
  const a = student.academic;
  return [
    `Страна: ${a.country}`,
    `GPA: ${a.gpa}/5.0, IELTS: ${a.ielts}, SAT: ${a.sat}, UNT/ЕНТ: ${a.untScore}/140`,
    `Интересы: ${student.preferences.interests.join(", ") || "—"}`,
    `Финансирование: ${student.preferences.financialStatus}`,
    `Награды: ${student.awards.length ? student.awards.join(", ") : "нет"}`,
    `Олимпиада подтверждена сертификатом (AI): ${student.olympiadVerified ? "да" : "нет"}`,
  ].join("\n");
}

export function useSmartAdvisor() {
  const { student, universityData } = useProfile();

  const getProgramAdvice = useCallback(
    async (programId: string): Promise<string> => {
      const found = getProgramBySlug(programId);
      if (!found) {
        throw new Error("Программа не найдена");
      }
      const { program, university } = found;
      const prompt = `Проанализируй баллы SAT ${student.academic.sat} и ЕНТ ${student.academic.untScore} для программы «${program.name}» (${university.name}, ${university.city}, поле: ${program.field}). Дай совет из 2 предложений. Учти также GPA ${student.academic.gpa.toFixed(1)} и IELTS ${student.academic.ielts.toFixed(1)}.`;
      return askQwen(prompt, ADVISOR_SYSTEM_PROMPT);
    },
    [student]
  );

  const getGeneralFitAdvice = useCallback(async (): Promise<string> => {
    const prompt = `Дай общую оценку шансов на поступление в «${universityData.name}» (${universityData.city}) для абитуриента:

${summarizeStudentBlock(student)}

Средний AI Fit по программам можно упомянуть контекстно, но не выдумывай точные цифры приёмной комиссии. Сформулируй краткий executive summary на 3–4 предложения: сильные стороны, риски, следующий шаг.`;

    return askQwen(prompt, ADVISOR_SYSTEM_PROMPT);
  }, [student, universityData]);

  const getScholarshipAdvice = useCallback(
    async (scholarshipName: string): Promise<string> => {
      const s = universityData.scholarships.find((x) => x.name === scholarshipName);
      const reqText = s?.requirements ?? "";
      const prompt = `Объясни, как награда «Olympiad Winner» (олимпиада) может усилить заявку на стипендию «${scholarshipName}» в контексте вузов Казахстана.

Требования стипендии (справочно): ${reqText.slice(0, 800)}

Профиль абитуриента:
${summarizeStudentBlock(student)}

Ответ: 2–3 предложения, конкретно про связь олимпиады с этой стипендией.`;

      return askQwen(prompt, ADVISOR_SYSTEM_PROMPT);
    },
    [student, universityData]
  );

  return {
    getProgramAdvice,
    getGeneralFitAdvice,
    getScholarshipAdvice,
  };
}
