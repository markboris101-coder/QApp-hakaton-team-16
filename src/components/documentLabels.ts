import type { StudentDocuments } from "../mockData";

/**
 * Обязательный перечень документов — ключи совпадают с `StudentDocuments`.
 * `lane` группирует карточки в UI; `priority` — порядок внутри дорожки.
 */
export type DocumentLane = "identity" | "academicRecords" | "health" | "portrait";

export const DOCUMENT_LANE_ORDER: DocumentLane[] = ["identity", "academicRecords", "health", "portrait"];

export type DocumentEntryMeta = {
  key: keyof StudentDocuments;
  /** Строка для UI (EN), как в ТЗ */
  label: string;
  /** Строка для UI (RU), как в ТЗ */
  labelRu: string;
  lane: DocumentLane;
  priority: number;
};

export const DOCUMENT_ENTRIES: DocumentEntryMeta[] = [
  {
    key: "passport",
    label: "ID / Passport",
    labelRu: "Удостоверение личности / Паспорт",
    lane: "identity",
    priority: 10,
  },
  {
    key: "academicTranscript",
    label: "Academic Transcript",
    labelRu: "Транскрипт с оценками",
    lane: "academicRecords",
    priority: 20,
  },
  {
    key: "diploma",
    label: "Diploma / Certificate",
    labelRu: "Аттестат или диплом",
    lane: "academicRecords",
    priority: 30,
  },
  {
    key: "medicalCertificate",
    label: "Medical Certificate",
    labelRu: "Медицинская справка 075/у",
    lane: "health",
    priority: 40,
  },
  {
    key: "photo3x4",
    label: "Photo 3×4",
    labelRu: "Фотография 3х4",
    lane: "portrait",
    priority: 50,
  },
];
