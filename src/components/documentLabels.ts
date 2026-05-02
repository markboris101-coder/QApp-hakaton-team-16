import type { StudentDocuments } from "../mockData";

/**
 * Обязательный перечень документов (названия для UI) — ТЗ п.3.
 * Ключи совпадают с `StudentDocuments` в mockData.
 */
export const DOCUMENT_ENTRIES: {
  key: keyof StudentDocuments;
  /** Строка для UI (EN), как в ТЗ */
  label: string;
  /** Строка для UI (RU), как в ТЗ */
  labelRu: string;
  /** Короткая подсказка для чек-листа */
  hintRu: string;
}[] = [
  {
    key: "passport",
    label: "ID / Passport",
    labelRu: "Удостоверение личности / Паспорт",
    hintRu: "Нужен для идентификации в заявлении и договоре; проверьте срок действия.",
  },
  {
    key: "photo3x4",
    label: "Photo 3×4",
    labelRu: "Фотография 3х4",
    hintRu: "Матовая бумага, цветное фото по требованиям приёмной комиссии.",
  },
  {
    key: "medicalCertificate",
    label: "Medical Certificate",
    labelRu: "Медицинская справка 075/у",
    hintRu: "Форма по правилам МЗ; часто действует ограниченное время — уточните у вуза.",
  },
  {
    key: "academicTranscript",
    label: "Academic Transcript",
    labelRu: "Транскрипт с оценками",
    hintRu: "Для конкурса и перевода баллов; приложите официальную версию с печатью школы/колледжа.",
  },
  {
    key: "diploma",
    label: "Diploma / Certificate",
    labelRu: "Аттестат или диплом",
    hintRu: "Подтверждение уровня образования; для неполного набора страниц — добавьте вкладыш.",
  },
];
