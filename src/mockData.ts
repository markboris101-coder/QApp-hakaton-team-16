/**
 * Smart University Profile — типы, студент по умолчанию, утилиты.
 * Каталог вузов: `src/catalog/universities/*.json` → `npm run catalog:bundle` → `universities.bundle.json`.
 */

import { mergeCatalogIntoUniversities } from "./data/universityDatabase/mergeCatalog";
import catalogUniversitiesRaw from "./catalog/universities.bundle.json";

/** Статус подготовки документа для абитуриента */
export type DocumentStatus = "READY" | "MISSING" | "PENDING";

/** Релевантность стипендии для AI-подсказок (ранжирование) */
export type ScholarshipAiRelevance = "High" | "Medium" | "Low";

/** Финансовое положение (ТЗ платформы) */
export type FinancialSituation = "Need Full Scholarship" | "Partial Scholarship" | "Self-funded";

/** Академический профиль студента */
export interface StudentAcademic {
  grade: string;
  country: string;
  gpa: number;
  gpaScale: string;
  ielts: number;
  /** Введённый суммарный SAT; `0` = не указывали / не сдавали (в Fit не штрафуем, опора на UNT). */
  sat: number;
  /** UNT / ЕНТ (Казахстан), 0–140 */
  untScore: number;
}

/** Предпочтения и цели поступления */
export interface StudentPreferences {
  interests: string[];
  language: string;
  financialStatus: FinancialSituation;
  city: string;
  goal: string;
}

/** Статусы комплекта документов */
export interface StudentDocuments {
  passport: DocumentStatus;
  photo3x4: DocumentStatus;
  medicalCertificate: DocumentStatus;
  academicTranscript: DocumentStatus;
  diploma: DocumentStatus;
}

export interface DocumentUploadMeta {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

/** Уровень значимости по шкале 0–4 (нет → локальный → регион → республика → международный). */
export type AchievementTier = 0 | 1 | 2 | 3 | 4;

/** Совокупная значимость прочих достижений (искусство, исследования, волонтёрство). */
export type OtherMeritTier = 0 | 1 | 2 | 3;

/**
 * Структурированные «бонусы» из текста (Qwen или эвристика).
 * Файл PNG + VERDICT: ACCEPT даёт дополнительный коэффициент доверия к олимпиаде.
 */
export interface AchievementProfile {
  olympiadTier: AchievementTier;
  sportsTier: AchievementTier;
  otherMerit: OtherMeritTier;
  /** Краткое резюме модели или эвристики */
  modelSummary?: string;
  /** Исходный текст пользователя */
  narrative?: string;
  parsedAt?: string;
  parseFailed?: boolean;
}

/** Полный профиль текущего пользователя-абитуриента */
export interface StudentProfile {
  academic: StudentAcademic;
  preferences: StudentPreferences;
  documents: StudentDocuments;
  /** Награды и достижения (строки из пресетов или свои) */
  awards: string[];
  documentUploads?: Partial<Record<keyof StudentDocuments, DocumentUploadMeta>>;
  /**
   * Олимпиада учитывается в fit score только после успешной AI-проверки загруженного PNG-сертификата.
   */
  olympiadVerified?: boolean;
  /** Достижения, разобранные из свободного текста (Qwen → числовые уровни). */
  achievementProfile?: AchievementProfile;
}

export interface ScholarshipInfo {
  name: string;
  requirements: string;
  aiRelevance: ScholarshipAiRelevance;
}

export type UniversityType = "Research" | "Technical" | "Comprehensive" | "Liberal Arts";

export type ProgramField =
  | "Engineering"
  | "Business"
  | "Science"
  | "Humanities"
  | "Social Sciences"
  | "Law"
  | "Medicine";

export type DegreeLevel = "Bachelor" | "Master" | "PhD";

/** Факультет / школа внутри вуза (mock для карточек и страницы программы) */
export interface UniversityFaculty {
  id: string;
  /** Каноническое англоязычное имя (поиск, ключи) */
  name: string;
  description: string;
  /** Локализованные подписи для интерфейса (опционально) */
  nameRu?: string;
  nameKk?: string;
  descriptionRu?: string;
  descriptionKk?: string;
}

/** Ориентир стоимости обучения по вузу (тенге в год, демо QApp — не официальный прайс) */
export interface TuitionOverview {
  minKzt: number;
  maxKzt: number;
  note: string;
}

/** Учебная программа вуза */
export interface UniversityProgram {
  /** Slug для URL `/program/:id` */
  id: string;
  name: string;
  /** Ссылка на `UniversityTemplate.faculties[].id` */
  facultyId: string;
  /** Ориентировочная стоимость за учебный год, ₸ (mock) */
  annualTuitionKzt: number;
  field: ProgramField;
  degree: DegreeLevel;
  durationYears: number;
  language: string;
  /** Mock-база совместимости до персонализации */
  fitScore: number;
  matchReason: string;
  /** Подробное описание программы (абзацы) */
  detailedDescription: string[];
  /** Специфические требования поступления */
  entryRequirements: string[];
}

/**
 * Ориентиры для модели Fit (не официальный отбор NU — см. modelNote).
 * Основаны на публичных требованиях NU: English-taught программы, конкурентный GPA,
 * SAT/ACT или Foundation Year, UNT/ЕНТ для казахстанских абитуриентов.
 */
export interface UniversityAdmissionExpectations {
  gpaScaleMax: number;
  /** Типичный порог «сильных» заявок на конкурентные программы (5-балльная шкала). */
  strongGpa: number;
  /** Ниже этого GPA конкурентоспособность на топ-программах NU резко падает. */
  competitiveGpa: number;
  competitiveSat: number;
  targetSat: number;
  competitiveUnt: number;
  targetUnt: number;
  /** Минимум для англоязычного обучения (официальный минимум часто 6.5+ для многих программ). */
  minIelts: number;
  modelNote: string;
}

export interface UniversityTemplate {
  /** Стабильный ключ для выбора вуза в MVP */
  id: string;
  name: string;
  nameRu?: string;
  nameKk?: string;
  /** Официальный сайт (для CTA и сайдбара по ТЗ §10). */
  officialWebsiteUrl?: string;
  admissionsEmail?: string;
  city: string;
  foundedYear: number;
  type: UniversityType;
  languagesOfInstruction: string[];
  applicationDeadline: string;
  /** MVP поле: кратко о стипендиях вуза (для hero / поиска) */
  scholarshipBlurb: string;
  /** Фон hero (Unsplash и т.п.) */
  heroImageUrl: string;
  /** Диапазон стоимости и пояснение (mock) */
  tuitionOverview: TuitionOverview;
  faculties: UniversityFaculty[];
  scholarships: ScholarshipInfo[];
  programs: UniversityProgram[];
  admissionExpectations: UniversityAdmissionExpectations;
}

export type ProgramLookup = { university: UniversityTemplate; program: UniversityProgram };

/** Форматирование суммы в тенге для UI */
export function formatTuitionKzt(n: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(n))} ₸ / год`;
}

export function formatTuitionBand(t: TuitionOverview): string {
  const a = new Intl.NumberFormat("ru-RU").format(t.minKzt);
  const b = new Intl.NumberFormat("ru-RU").format(t.maxKzt);
  return `${a}–${b} ₸/год (ориентир)`;
}

export function getFaculty(u: UniversityTemplate, facultyId: string): UniversityFaculty | undefined {
  return u.faculties.find((f) => f.id === facultyId);
}

// -----------------------------------------------------------------------------
// Мок студента
// -----------------------------------------------------------------------------

export const currentStudent: StudentProfile = {
  academic: {
    grade: "Grade 11",
    country: "Kazakhstan",
    gpa: 4.7,
    gpaScale: "out of 5.0",
    ielts: 7.0,
    sat: 1380,
    untScore: 118,
  },
  preferences: {
    interests: ["Computer Science", "Business", "Engineering"],
    language: "English",
    financialStatus: "Need Full Scholarship",
    city: "Astana or large cities",
    goal: "Fall 2026 admission",
  },
  awards: ["Olympiad Winner"],
  olympiadVerified: false,
  achievementProfile: {
    olympiadTier: 0,
    sportsTier: 0,
    otherMerit: 0,
  },
  documents: {
    passport: "READY",
    photo3x4: "READY",
    medicalCertificate: "MISSING",
    academicTranscript: "READY",
    diploma: "MISSING",
  },
};

// -----------------------------------------------------------------------------
// Каталог вузов: добавляйте файлы в src/catalog/universities/*.json, затем npm run catalog:bundle
// -----------------------------------------------------------------------------
const catalogUniversities = catalogUniversitiesRaw as UniversityTemplate[];

/**
 * Все вузы: JSON-бандл + доп. факультеты (mergeCatalog / extraFaculties).
 */
export const UNIVERSITIES: UniversityTemplate[] = mergeCatalogIntoUniversities(catalogUniversities);

const defaultUni = UNIVERSITIES.find((u) => u.id === "nu") ?? UNIVERSITIES[0];
if (!defaultUni) throw new Error("University catalog is empty");

/** Вуз по умолчанию для демо (NU или первый в каталоге). */
export const universityData: UniversityTemplate = defaultUni;

export function getProgramBySlug(slug: string): ProgramLookup | undefined {
  for (const u of UNIVERSITIES) {
    const program = u.programs.find((p) => p.id === slug);
    if (program) return { university: u, program };
  }
  return undefined;
}
