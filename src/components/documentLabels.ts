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
}[] = [
  {
    key: "passport",
    label: "ID / Passport",
    labelRu: "Удостоверение личности / Паспорт",
  },
  {
    key: "photo3x4",
    label: "Photo 3×4",
    labelRu: "Фотография 3х4",
  },
  {
    key: "medicalCertificate",
    label: "Medical Certificate",
    labelRu: "Медицинская справка 075/у",
  },
  {
    key: "academicTranscript",
    label: "Academic Transcript",
    labelRu: "Транскрипт с оценками",
  },
  {
    key: "diploma",
    label: "Diploma / Certificate",
    labelRu: "Аттестат или диплом",
  },
];
