/**
 * Smart University Profile — Single Source of Truth для frontend-прототипа (хакатон QApp).
 */

import { mergeCatalogIntoUniversities } from "./data/universityDatabase/mergeCatalog";
import { ADDITIONAL_KAZAKHSTAN_UNIVERSITIES } from "./data/universityDatabase/newInstitutions";

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
  name: string;
  description: string;
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
// Nazarbayev University — программы (реальные названия, slugs для роутинга)
// -----------------------------------------------------------------------------

const UNIVERSITY_NU: UniversityTemplate = {
  id: "nu",
  name: "Nazarbayev University",
  city: "Astana, Kazakhstan",
  foundedYear: 2010,
  type: "Research",
  languagesOfInstruction: ["English"],
  applicationDeadline: "2026-04-15",
  scholarshipBlurb:
    "Merit-based NU Scholarship, need-based financial aid, STEM/Olympiad recognition and regional talent grants (mock summary for QApp demo).",
  heroImageUrl:
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=72",
  tuitionOverview: {
    minKzt: 9_200_000,
    maxKzt: 12_800_000,
    note: "Ориентир по бакалавриату (английский), без учёта общежития. Точные суммы — в оферте приёма; mock QApp.",
  },
  faculties: [
    {
      id: "nu-seds",
      name: "School of Engineering and Digital Sciences",
      description:
        "Инженерные и цифровые направления: от робототехники и Data Science до вычислительной физики. Акцент на лаборатории, международные стандарты ABET-ориентира и исследовательские группы.",
    },
    {
      id: "nu-science",
      name: "School of Sciences and Humanities",
      description:
        "Естественные науки и междисциплинарные гуманитарные треки: биология, химия, математика; поддержка undergraduate research и публикаций.",
    },
    {
      id: "nu-ssh",
      name: "School of Social Sciences",
      description:
        "Экономика, политология и смежные социальные дисциплины в англоязычной среде; кейсы, политический анализ и подготовка к глобальным магистратурам.",
    },
  ],
  admissionExpectations: {
    gpaScaleMax: 5.0,
    strongGpa: 4.5,
    competitiveGpa: 4.0,
    competitiveSat: 1280,
    targetSat: 1450,
    competitiveUnt: 108,
    targetUnt: 125,
    minIelts: 6.5,
    modelNote:
      "Модель Fit ориентирована на публичные требования NU (англоязычное обучение, конкурентный академический профиль, SAT/UNT как часть портфеля). Не заменяет решение приёмной комиссии.",
  },
  scholarships: [
    {
      name: "NU Scholarship",
      requirements:
        "Strong secondary school GPA, competitive SAT/ACT or NU Foundation Year record, English proficiency (IELTS/TOEFL). Merit-based; full or partial tuition coverage depending on ranking.",
      aiRelevance: "High",
    },
    {
      name: "Need-Based Financial Aid",
      requirements:
        "Documented financial need, satisfactory academic progress, timely application through NU admissions portal. May combine with partial merit awards.",
      aiRelevance: "High",
    },
    {
      name: "Science Olympiad / Competition Recognition",
      requirements:
        "National or international awards in STEM or relevant subjects; verification of certificates. Can strengthen scholarship tier for STEM programs.",
      aiRelevance: "Medium",
    },
    {
      name: "Regional Talent Grant (Kazakhstan)",
      requirements:
        "Citizens of Kazakhstan, priority regions per NU policy in the admissions cycle; additional essay or interview may apply.",
      aiRelevance: "Medium",
    },
    {
      name: "Sports / Cultural Achievement Award",
      requirements:
        "Documented high-level achievement in sport or arts; lower tuition discount than flagship merit awards; limited seats.",
      aiRelevance: "Low",
    },
  ],
  programs: [
    {
      id: "nu-bsc-computer-science",
      name: "BSc in Computer Science",
      facultyId: "nu-seds",
      annualTuitionKzt: 12_800_000,
      field: "Engineering",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 88,
      matchReason:
        "Strong CS pathway with computing fundamentals, algorithms, and systems — aligned with tech-focused applicants.",
      detailedDescription: [
        "The BSc in Computer Science at NU trains students in programming languages, discrete mathematics, algorithms, software engineering, and modern computing systems.",
        "Electives cover AI/ML, security, and human–computer interaction; small cohorts support lab-intensive coursework and undergraduate research.",
        "Graduates pursue software engineering, product development, and graduate study at competitive institutions worldwide.",
      ],
      entryRequirements: [
        "IELTS 6.5+ or equivalent English proficiency",
        "Strong secondary STEM preparation; competitive SAT (Evidence-Based Reading & Writing + Math total considered holistically)",
        "Recommended: SAT Math section 750+ for strongest quantitative readiness signal",
      ],
    },
    {
      id: "nu-bsc-robotics-mechatronics",
      name: "BSc in Robotics and Mechatronics",
      facultyId: "nu-seds",
      annualTuitionKzt: 11_500_000,
      field: "Engineering",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 82,
      matchReason:
        "Hands-on mechanical, electrical, and control engineering — ideal for students combining physics interest with programming.",
      detailedDescription: [
        "Integrates mechanics, electronics, embedded systems, and control theory with robotics projects and design studios.",
        "Laboratory work emphasizes sensors, actuators, automation, and interdisciplinary team projects.",
        "Prepares students for advanced manufacturing, autonomous systems, and related graduate engineering paths.",
      ],
      entryRequirements: [
        "IELTS 6.5+",
        "Solid grades in mathematics and physics",
        "SAT Math 720+ recommended; portfolio of STEM projects or competitions is a plus",
      ],
    },
    {
      id: "nu-bsc-data-science",
      name: "BSc in Data Science",
      facultyId: "nu-seds",
      annualTuitionKzt: 12_200_000,
      field: "Science",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 85,
      matchReason:
        "Statistical modeling, programming, and domain analytics — fits analytical profiles bridging math and computing.",
      detailedDescription: [
        "Combines probability, statistics, machine learning, and computation with applications across science and industry.",
        "Coursework typically includes linear algebra, databases, visualization, and ethics of data-driven decision-making.",
        "Career paths include analytics, ML engineering, and research-oriented roles requiring quantitative depth.",
      ],
      entryRequirements: [
        "IELTS 6.5+",
        "Strong performance in mathematics; familiarity with programming is helpful",
        "Competitive SAT with balanced verbal/quantitative reasoning; STEM olympiad results valued",
      ],
    },
    {
      id: "nu-ba-economics",
      name: "B.A. in Economics",
      facultyId: "nu-ssh",
      annualTuitionKzt: 10_800_000,
      field: "Business",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 80,
      matchReason:
        "Micro/macro theory, econometrics, and policy — suited to students interested in markets, finance, and decision science.",
      detailedDescription: [
        "Core economics theory plus quantitative methods and policy analysis in an English-medium liberal education environment.",
        "Opportunities for research assistantships, internships, and cross-registration with related quantitative fields.",
        "Graduates enter consulting, public policy, finance, and competitive graduate programs.",
      ],
      entryRequirements: [
        "IELTS 6.5+",
        "Strong quantitative skills; mathematics preparation expected",
        "SAT Evidence-Based Reading & Writing and Math reviewed holistically (no single cut-off published publicly)",
      ],
    },
    {
      id: "nu-bsc-biological-sciences",
      name: "BSc in Biological Sciences",
      facultyId: "nu-science",
      annualTuitionKzt: 11_000_000,
      field: "Science",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 68,
      matchReason:
        "Molecular biology, genetics, and physiology tracks — for students committed to life sciences and research labs.",
      detailedDescription: [
        "Laboratory-intensive curriculum spanning cell biology, genetics, ecology, and physiology with research mentorship.",
        "Pathways toward medicine-adjacent careers, biotechnology, and graduate study in biology and related fields.",
        "Interdisciplinary links with chemistry and computational biology where available.",
      ],
      entryRequirements: [
        "IELTS 6.5+",
        "Strong foundation in biology and chemistry",
        "SAT with solid STEM subsection profile recommended",
      ],
    },
    {
      id: "nu-ba-political-science-ir",
      name: "B.A. in Political Science and International Relations",
      facultyId: "nu-ssh",
      annualTuitionKzt: 10_200_000,
      field: "Social Sciences",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 72,
      matchReason:
        "International politics, institutions, and comparative analysis — strong writing and critical reasoning expected.",
      detailedDescription: [
        "Examines political theory, international security, diplomacy, and regional studies with research-oriented seminars.",
        "Develops argumentation, policy analysis, and qualitative/quantitative research skills applicable to global careers.",
        "Graduates pursue law, public service, NGOs, international organizations, and related graduate degrees.",
      ],
      entryRequirements: [
        "IELTS 6.5+ (strong writing skills)",
        "Evidence of analytical writing or debate experience is advantageous",
        "SAT Evidence-Based Reading & Writing weighted alongside overall academic record",
      ],
    },
  ],
};

// -----------------------------------------------------------------------------
// Kazakh-British Technical University (KBTU) — mock по шаблону QApp
// -----------------------------------------------------------------------------

const UNIVERSITY_KBTU: UniversityTemplate = {
  id: "kbtu",
  name: "Kazakh-British Technical University",
  city: "Almaty, Kazakhstan",
  foundedYear: 2000,
  type: "Technical",
  languagesOfInstruction: ["English", "Russian"],
  applicationDeadline: "2026-07-01",
  scholarshipBlurb:
    "Academic excellence scholarships, STEM achievement awards and partial tuition support for strong applicants (mock).",
  heroImageUrl:
    "https://images.unsplash.com/photo-1564981797829-6f5d176d8e31?auto=format&fit=crop&w=1800&q=72",
  tuitionOverview: {
    minKzt: 3_200_000,
    maxKzt: 5_200_000,
    note: "Смешанные EN/RU потоки; в mock указана вилка бакалавриата. Магистратура и грант-контракты считаются отдельно.",
  },
  faculties: [
    {
      id: "kbtu-fit",
      name: "Faculty of Information Technologies & Digital Engineering",
      description:
        "Прикладной IT, автоматизация, цифровой инжиниринг: связка программирования, электроники и промышленных стандартов; стажировки в отраслевых компаниях региона.",
    },
    {
      id: "kbtu-energy",
      name: "Faculty of Energy, Oil and Gas",
      description:
        "Классическое сильное направление KBTU: добыча, бурение, нефтегазовая механика, экология и безопасность; лаборатории с отраслевым оборудованием (иллюстративно).",
    },
    {
      id: "kbtu-business",
      name: "Business School",
      description:
        "Менеджмент, экономика и предпринимательство в контексте инженерного вуза; кейсы и международные партнёрские программы.",
    },
  ],
  admissionExpectations: {
    gpaScaleMax: 5.0,
    strongGpa: 4.4,
    competitiveGpa: 3.9,
    competitiveSat: 1220,
    targetSat: 1380,
    competitiveUnt: 100,
    targetUnt: 118,
    minIelts: 6.0,
    modelNote:
      "Fit-модель для KBTU: акцент на инженерные и IT-программы; пороги чуть мягче премиального NU, IELTS часто от 6.0 для смешанного EN/RU обучения. Иллюстрация для MVP.",
  },
  scholarships: [
    {
      name: "KBTU Academic Excellence",
      requirements:
        "Strong GPA in STEM subjects, portfolio of projects or competitions; English or Russian proficiency per program track.",
      aiRelevance: "High",
    },
    {
      name: "Presidential / State quota pathways",
      requirements:
        "Kazakhstan citizens may qualify via national programs subject to annual quotas; documents verified through admissions office.",
      aiRelevance: "Medium",
    },
    {
      name: "Women in STEM incentive (mock)",
      requirements:
        "Merit-based supplement for competitive female applicants in selected engineering and computing programs — demo entry.",
      aiRelevance: "Medium",
    },
    {
      name: "Sports & leadership stipend",
      requirements:
        "Documented national-level sport or student leadership; smaller tuition discount than flagship merit awards.",
      aiRelevance: "Low",
    },
  ],
  programs: [
    {
      id: "kbtu-bsc-information-systems",
      name: "BSc in Information Systems",
      facultyId: "kbtu-fit",
      annualTuitionKzt: 4_200_000,
      field: "Engineering",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 84,
      matchReason:
        "Business analysis, databases and software engineering — fits applicants wanting applied computing in industry contexts.",
      detailedDescription: [
        "Focus on enterprise systems, software development lifecycle, data management and IT consulting skills.",
        "Coursework bridges computer science foundations with management information systems.",
        "Graduates join banks, telecoms, and tech integrators across Kazakhstan and abroad.",
      ],
      entryRequirements: [
        "Mathematics and informatics preparation",
        "IELTS 6.0+ for English track or Russian proficiency for parallel track",
        "Competitive UNT/SAT considered holistically",
      ],
    },
    {
      id: "kbtu-bsc-automation-control",
      name: "BSc in Automation and Control",
      facultyId: "kbtu-energy",
      annualTuitionKzt: 3_600_000,
      field: "Engineering",
      degree: "Bachelor",
      durationYears: 4,
      language: "Russian",
      fitScore: 79,
      matchReason:
        "Control theory, industrial automation and instrumentation — for students strong in physics and linear algebra.",
      detailedDescription: [
        "Laboratory-intensive study of PLCs, robotics integration, and process control.",
        "Links to oil & gas and manufacturing sectors prevalent in the region.",
      ],
      entryRequirements: ["Strong physics and mathematics", "UNT threshold varies by year", "Russian medium — proof of proficiency"],
    },
    {
      id: "kbtu-bsc-oil-gas-engineering",
      name: "BSc in Oil and Gas Engineering",
      facultyId: "kbtu-energy",
      annualTuitionKzt: 4_800_000,
      field: "Engineering",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 76,
      matchReason:
        "Reservoir, drilling and production fundamentals aligned with Kazakhstan’s energy sector demand.",
      detailedDescription: [
        "Petroleum engineering core with safety and environmental modules.",
        "Industry internships with national operators — illustrative mock.",
      ],
      entryRequirements: ["IELTS 6.0+", "Chemistry and physics foundation", "Competitive GPA"],
    },
    {
      id: "kbtu-ba-business-administration",
      name: "B.A. in Business Administration",
      facultyId: "kbtu-business",
      annualTuitionKzt: 3_900_000,
      field: "Business",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 77,
      matchReason:
        "Management, finance and entrepreneurship tracks — analytical applicants with leadership interests.",
      detailedDescription: [
        "Core business curriculum with quantitative methods and strategy projects.",
      ],
      entryRequirements: ["IELTS 6.0+", "Mathematics for business", "Holistic review"],
    },
    {
      id: "kbtu-msc-computer-science",
      name: "MSc in Computer Science",
      facultyId: "kbtu-fit",
      annualTuitionKzt: 5_100_000,
      field: "Engineering",
      degree: "Master",
      durationYears: 2,
      language: "English",
      fitScore: 81,
      matchReason:
        "Graduate depth in algorithms and systems — for bachelor graduates raising research or senior engineering profile.",
      detailedDescription: [
        "Advanced coursework and thesis component in CS research groups.",
      ],
      entryRequirements: [
        "Relevant bachelor degree",
        "IELTS 6.5+",
        "Strong bachelor GPA and motivation statement",
      ],
    },
    {
      id: "kbtu-bsc-digital-engineering",
      name: "BSc in Digital Engineering",
      facultyId: "kbtu-fit",
      annualTuitionKzt: 4_000_000,
      field: "Engineering",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 83,
      matchReason:
        "Cross-disciplinary digital design, IoT and smart systems — modern Industry 4.0 angle.",
      detailedDescription: [
        "Combines mechanical design signals with computing and embedded platforms.",
      ],
      entryRequirements: ["STEM portfolio", "IELTS 6.0+", "UNT/SAT competitive"],
    },
  ],
};

// -----------------------------------------------------------------------------
// Astana IT University (AITU) — mock по шаблону QApp
// -----------------------------------------------------------------------------

const UNIVERSITY_AITU: UniversityTemplate = {
  id: "aitu",
  name: "Astana IT University",
  city: "Astana, Kazakhstan",
  foundedYear: 2019,
  type: "Technical",
  languagesOfInstruction: ["English", "Kazakh", "Russian"],
  applicationDeadline: "2026-06-15",
  scholarshipBlurb:
    "Tech-talent grants, digital innovation stipends and partner-company co-funding for strong computing applicants (mock).",
  heroImageUrl:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1800&q=72",
  tuitionOverview: {
    minKzt: 5_000_000,
    maxKzt: 6_500_000,
    note: "IT-бакалавриат в Astana IT U.; partner-треки и лаборатории могут менять стоимость (mock).",
  },
  faculties: [
    {
      id: "aitu-computing",
      name: "School of Digital Technologies & Computing",
      description:
        "Базовый контур AITU: computer science, software engineering, data и робототехника с практикой в продуктовых командах и хакатонах.",
    },
    {
      id: "aitu-cyber",
      name: "Institute of Cybersecurity & Digital Resilience",
      description:
        "Защита информации, криптография, SOC-практики и безопасная разработка; сценарии red/blue team и compliance.",
    },
    {
      id: "aitu-digital-econ",
      name: "School of Digital Economy & Innovation",
      description:
        "Цифровой бизнес, продукт, аналитика и инновационное предпринимательство на стыке менеджмента и tech.",
    },
  ],
  admissionExpectations: {
    gpaScaleMax: 5.0,
    strongGpa: 4.5,
    competitiveGpa: 3.85,
    competitiveSat: 1240,
    targetSat: 1420,
    competitiveUnt: 105,
    targetUnt: 122,
    minIelts: 6.0,
    modelNote:
      "AITU ориентирован на IT и цифровую экономику; Fit-модель подчёркивает математику, программирование и английский для англоязычных потоков.",
  },
  scholarships: [
    {
      name: "AITU Digital Talent Grant",
      requirements:
        "Portfolio of coding projects, hackathons or olympiads; competitive GPA; English for English-medium tracks.",
      aiRelevance: "High",
    },
    {
      name: "Need-aware tech access award",
      requirements:
        "Documented financial constraints plus satisfactory academic progress; limited seats per cycle (mock).",
      aiRelevance: "High",
    },
    {
      name: "Industry partner fellowship",
      requirements:
        "Co-funded placements with technology employers; interview and technical screening — illustrative MVP entry.",
      aiRelevance: "Medium",
    },
    {
      name: "Regional ICT scholarship",
      requirements:
        "Priority for applicants from designated regions of Kazakhstan per annual policy — demo placeholder.",
      aiRelevance: "Low",
    },
  ],
  programs: [
    {
      id: "aitu-bsc-computer-science",
      name: "BSc in Computer Science",
      facultyId: "aitu-computing",
      annualTuitionKzt: 5_800_000,
      field: "Engineering",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 86,
      matchReason:
        "Core CS plus cloud and software engineering electives — flagship tech pathway at AITU.",
      detailedDescription: [
        "Programming, discrete math, systems and theory with project-based learning.",
        "Strong ecosystem ties to Astana tech hub — mock narrative.",
      ],
      entryRequirements: ["IELTS 6.0+", "Mathematics and informatics", "Portfolio recommended"],
    },
    {
      id: "aitu-bsc-big-data",
      name: "BSc in Big Data Analytics",
      facultyId: "aitu-computing",
      annualTuitionKzt: 5_600_000,
      field: "Science",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 84,
      matchReason:
        "Statistics, distributed systems and ML pipelines — ideal for data-minded applicants.",
      detailedDescription: ["Data engineering, visualization and modeling coursework."],
      entryRequirements: ["Strong math", "IELTS 6.0+", "Problem-solving assessment"],
    },
    {
      id: "aitu-bsc-cybersecurity",
      name: "BSc in Cybersecurity",
      facultyId: "aitu-cyber",
      annualTuitionKzt: 6_000_000,
      field: "Engineering",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 82,
      matchReason:
        "Network security, cryptography labs and blue/red team exercises — hands-on defensive security.",
      detailedDescription: ["Ethical hacking basics and secure software development practices."],
      entryRequirements: ["IELTS 6.0+", "Logical reasoning", "Clean disciplinary record"],
    },
    {
      id: "aitu-ba-digital-business",
      name: "B.A. in Digital Business",
      facultyId: "aitu-digital-econ",
      annualTuitionKzt: 5_200_000,
      field: "Business",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 78,
      matchReason:
        "Product, analytics and digital marketing at the intersection of tech and management.",
      detailedDescription: ["Lean startup projects and analytics tooling — mock summary."],
      entryRequirements: ["IELTS 6.0+", "Quantitative readiness"],
    },
    {
      id: "aitu-bsc-software-engineering",
      name: "BSc in Software Engineering",
      facultyId: "aitu-computing",
      annualTuitionKzt: 6_100_000,
      field: "Engineering",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 87,
      matchReason:
        "End-to-end software delivery, agile teams and quality assurance — strong alignment with product-oriented students.",
      detailedDescription: [
        "Design patterns, testing, DevOps introduction and capstone industry projects.",
      ],
      entryRequirements: ["Git/portfolio plus GPA", "IELTS 6.0+"],
    },
    {
      id: "aitu-bsc-robotics-ai",
      name: "BSc in Robotics and Intelligent Systems",
      facultyId: "aitu-computing",
      annualTuitionKzt: 5_900_000,
      field: "Engineering",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 80,
      matchReason:
        "Embedded AI, perception and control — bridges mechanical intuition with AI tooling.",
      detailedDescription: ["ROS-style projects and interdisciplinary labs — illustrative."],
      entryRequirements: ["Physics & math", "IELTS 6.0+", "Creative portfolio"],
    },
  ],
};

// -----------------------------------------------------------------------------
// al-Farabi Kazakh National University (KazNU) — mock
// -----------------------------------------------------------------------------

const UNIVERSITY_KAZNU: UniversityTemplate = {
  id: "kaznu",
  name: "al-Farabi Kazakh National University",
  city: "Almaty, Kazakhstan",
  foundedYear: 1934,
  type: "Comprehensive",
  languagesOfInstruction: ["Kazakh", "Russian", "English"],
  applicationDeadline: "2026-08-01",
  scholarshipBlurb:
    "Государственные гранты, стипендии для лучших по UNT, целевые квоты и социальные категории (иллюстративно для QApp; уточняйте в приёмной комиссии).",
  heroImageUrl:
    "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=1800&q=72",
  tuitionOverview: {
    minKzt: 1_200_000,
    maxKzt: 2_800_000,
    note: "Вилка для контрактного обучения (грант = 0 ₸); цифры ориентировочные по крупным факультетам, mock.",
  },
  faculties: [
    {
      id: "kaznu-physmath",
      name: "Faculty of Mechanics and Mathematics",
      description:
        "Фундаментальная подготовка в математике, механике и математическом моделировании; сильные кафедры анализа, дифференциальных уравнений и прикладной механики.",
    },
    {
      id: "kaznu-bio",
      name: "Faculty of Biology and Biotechnology",
      description:
        "Современная биология, молекулярная генетика, экология и биотех: лаборатории, полевые практики и выход в науку Республики.",
    },
    {
      id: "kaznu-law",
      name: "Faculty of Law",
      description:
        "Классическое юридическое образование с уклоном в гражданское, уголовное и международное право; мoot-courts и договорная работа.",
    },
    {
      id: "kaznu-journ",
      name: "Faculty of Journalism",
      description:
        "Медиа, цифровой контент, расследовательская журналистика и дизайн коммуникаций; учебные студии и проекты с отраслевыми партнёрами.",
    },
    {
      id: "kaznu-chem",
      name: "Faculty of Chemistry and Chemical Technology",
      description:
        "Синтез, аналитическая химия, катализ и зелёная химия; мост к фармацевтике, материаловедению и нефтехимии.",
    },
    {
      id: "kaznu-phil",
      name: "Faculty of Philology",
      description:
        "Лингвистика, перевод, литературоведение трёх языков; гуманитарный костяк национального университета.",
    },
    {
      id: "kaznu-hseb",
      name: "Higher School of Economics and Business",
      description:
        "Финансы, менеджмент и экономическая аналитика: микро- и макроэкономика, инвестиции, корпоративные финансы в бакалавриате и магистратуре.",
    },
  ],
  admissionExpectations: {
    gpaScaleMax: 5.0,
    strongGpa: 4.2,
    competitiveGpa: 3.6,
    competitiveSat: 1100,
    targetSat: 1280,
    competitiveUnt: 90,
    targetUnt: 110,
    minIelts: 5.5,
    modelNote:
      "КазНУ — крупный классический вуз: конкуренция на бюджет высокая; для mock Fit мягче SAT, сильнее UNT/школьный GPA. EN-программы встречаются точечно.",
  },
  scholarships: [
    {
      name: "State educational grant (Kazakhstan)",
      requirements: "Competitive UNT + school portfolio; full tuition on grant track for citizens (policy varies by year).",
      aiRelevance: "High",
    },
    {
      name: "Rector’s merit list",
      requirements: "Top cohort GPA; may include partial contract discount in selected faculties — mock label.",
      aiRelevance: "Medium",
    },
    {
      name: "Regional youth support (mock)",
      requirements: "Documented residence in priority regions as per annual government lists.",
      aiRelevance: "Low",
    },
  ],
  programs: [
    {
      id: "kaznu-bsc-mathematics",
      name: "BSc in Mathematics",
      facultyId: "kaznu-physmath",
      annualTuitionKzt: 1_450_000,
      field: "Science",
      degree: "Bachelor",
      durationYears: 4,
      language: "Russian / Kazakh",
      fitScore: 78,
      matchReason:
        "Фундаментальная математика для тех, кто хочет ML/финансовую математику и академическую траекторию.",
      detailedDescription: [
        "Анализ, алгебра, дифференциальные уравнения и дискретная математика с исследовательскими семинарами.",
        "Мосты в магистратуру по прикладной математике, data science и преподаванию; конкурсы и олимпиадная подготовка.",
        "Смежные кафедры позволяют подобрать минор по информатике или экономике.",
      ],
      entryRequirements: ["UNT или эквивалент по профилю", "Школьная математика высокого уровня", "Собеседование на некоторые потоки"],
    },
    {
      id: "kaznu-bsc-molecular-biology",
      name: "BSc in Molecular Biology",
      facultyId: "kaznu-bio",
      annualTuitionKzt: 1_680_000,
      field: "Science",
      degree: "Bachelor",
      durationYears: 4,
      language: "Russian",
      fitScore: 74,
      matchReason:
        "Лабораторная биология и генетика — для абитуриентов с сильной химией и интересом к R&D.",
      detailedDescription: [
        "Клеточная биология, генетика, биохимия и микробиология с проектами в кампусных лабораториях.",
        "Практики в институтах и клиниках-партнёрах (иллюстративно); выход в магистратуру биомед.",
      ],
      entryRequirements: ["Биология и химия в школьном аттестате", "UNT профильный или внутренние экзамены", "Медицинская книжка по запросу практик"],
    },
    {
      id: "kaznu-llb-law",
      name: "LL.B. in Law",
      facultyId: "kaznu-law",
      annualTuitionKzt: 1_900_000,
      field: "Law",
      degree: "Bachelor",
      durationYears: 4,
      language: "Kazakh / Russian",
      fitScore: 72,
      matchReason:
        "Классическое юридическое образование в крупнейшем правовом факультете страны (по репутации).",
      detailedDescription: [
        "Гражданское, уголовное, конституционное и административное право; процессуальные дисциплины и клиники.",
        "Судебные и ADR-модули, стажировки в госорганах и компаниях (описательно).",
      ],
      entryRequirements: ["Сильные гуманитарные оценки", "Истории и обществознание", "Конкурс портфолио/эссе — по годам"],
    },
    {
      id: "kaznu-ba-journalism",
      name: "B.A. in Journalism and Mass Communications",
      facultyId: "kaznu-journ",
      annualTuitionKzt: 1_720_000,
      field: "Humanities",
      degree: "Bachelor",
      durationYears: 4,
      language: "Kazakh / Russian",
      fitScore: 70,
      matchReason:
        "Медиа, креатив и цифровой сторителлинг — для пишущих и визуально сильных кандидатов.",
      detailedDescription: [
        "Репортаж, радио, ТВ, цифровые платформы; этика, медиаправо и аналитика контента.",
        "Учебные студии, макетное мастерство, соцсети и data-journalism вводные курсы.",
      ],
      entryRequirements: ["Творческий конкурс / портфолио", "Сочинение на вступительных (если предусмотрено)", "UNT и внутр. испытания"],
    },
    {
      id: "kaznu-bsc-chemistry",
      name: "BSc in Chemistry",
      facultyId: "kaznu-chem",
      annualTuitionKzt: 1_550_000,
      field: "Science",
      degree: "Bachelor",
      durationYears: 4,
      language: "Russian",
      fitScore: 76,
      matchReason:
        "Органика, неорганика, аналитика — база для фармы, материалов и нефтехимии в Казахстане.",
      detailedDescription: [
        "Лабораторный трек с инструментальными методами: спектроскопия, хроматография, синтез.",
        "Связи с научно-исследовательскими лабораториями и отраслевыми стажировками.",
      ],
      entryRequirements: ["Химия в аттестате", "Конкурс UNT", "Вступительные по химии — уточнять в год"],
    },
    {
      id: "kaznu-ba-translation",
      name: "B.A. in Translation Studies",
      facultyId: "kaznu-phil",
      annualTuitionKzt: 1_380_000,
      field: "Humanities",
      degree: "Bachelor",
      durationYears: 4,
      language: "Kazakh / Russian / English",
      fitScore: 69,
      matchReason:
        "Перевод и межкультурная коммуникация — трёхъязычные компетенции для дипломатии и бизнеса.",
      detailedDescription: [
        "Теория и практика последовательного и письменного перевода, терминология, CAT-tools вводно.",
        "Смежные курсы культурологии и деловой коммуникации; мосты в магистратуру лингвистики.",
      ],
      entryRequirements: ["Высокий уровень языка (внутр. тесты)", "ESH/олимпиады — плюс", "Портфолио эссе"],
    },
    {
      id: "kaznu-msc-finance",
      name: "MSc in Finance",
      facultyId: "kaznu-hseb",
      annualTuitionKzt: 2_800_000,
      field: "Business",
      degree: "Master",
      durationYears: 2,
      language: "English / Russian",
      fitScore: 75,
      matchReason:
        "Корпоративные финансы и инвестиции для выпускников бакалавриата экономики и смежных полей.",
      detailedDescription: [
        "DCF, рынки капитала, риск-менеджмент, финансовое моделирование в Excel/Python.",
        "Кейсы с эмитентами KASE и международными стандартами отчётности — учебные симуляции.",
      ],
      entryRequirements: ["Релевантный бакалавр", "GMAT/внутренний экзамен — по году", "IELTS 6.0+ для англоязычного потока"],
    },
  ],
};

// -----------------------------------------------------------------------------
// Suleyman Demirel University (SDU) — mock
// -----------------------------------------------------------------------------

const UNIVERSITY_SDU: UniversityTemplate = {
  id: "sdu",
  name: "Suleyman Demirel University",
  city: "Kaskelen, Almaty Region, Kazakhstan",
  foundedYear: 1996,
  type: "Comprehensive",
  languagesOfInstruction: ["English", "Kazakh", "Russian"],
  applicationDeadline: "2026-07-20",
  scholarshipBlurb:
    "Академические стипендии SDU, партнёрские гранты IT-компаний и социальные скидки на контракт (mock-описание для демо).",
  heroImageUrl:
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1800&q=72",
  tuitionOverview: {
    minKzt: 2_400_000,
    maxKzt: 4_100_000,
    note: "Кампус в Каскелене; стоимость зависит от факультета и языка обучения (mock).",
  },
  faculties: [
    {
      id: "sdu-eng",
      name: "Faculty of Engineering and Natural Sciences",
      description:
        "Инженерия, IT и естественные науки в современном кампусе: проектное обучение, лаборатории и хакатоны с индустрией.",
    },
    {
      id: "sdu-law-soc",
      name: "Faculty of Law and Social Sciences",
      description:
        "Право, международные отношения, социология и публичная политика — с модульными стажировками.",
    },
    {
      id: "sdu-bus",
      name: "Faculty of Business and Economics",
      description:
        "Бизнес-администрирование, финансы, маркетинг и предпринимательство; аккредитации и двойные дипломы — по партнёрским программам.",
    },
    {
      id: "sdu-arch",
      name: "Faculty of Architecture and Design",
      description:
        "Архитектура города и ландшафта, дизайн среды; студии макетирования, BIM-ввод и урбанистические проекты.",
    },
  ],
  admissionExpectations: {
    gpaScaleMax: 5.0,
    strongGpa: 4.3,
    competitiveGpa: 3.75,
    competitiveSat: 1180,
    targetSat: 1360,
    competitiveUnt: 95,
    targetUnt: 115,
    minIelts: 6.0,
    modelNote:
      "SDU — частный кампусный вуз; Fit учитывает англоязычные программы и конкуренцию по контракту.",
  },
  scholarships: [
    {
      name: "SDU Academic Scholarship",
      requirements: "High GPA and admission ranking; partial tuition waiver — illustrative.",
      aiRelevance: "High",
    },
    {
      name: "Women in STEM grant (mock)",
      requirements: "Merit + motivation letter for selected engineering tracks.",
      aiRelevance: "Medium",
    },
    {
      name: "Sibling discount policy (mock)",
      requirements: "Family with two or more siblings enrolled — marketing placeholder.",
      aiRelevance: "Low",
    },
  ],
  programs: [
    {
      id: "sdu-bsc-computer-engineering",
      name: "BSc in Computer Engineering",
      facultyId: "sdu-eng",
      annualTuitionKzt: 3_950_000,
      field: "Engineering",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 83,
      matchReason:
        "Аппаратно-программный стек: от микропроцессоров до embedded и backend — для hardware-curious разработчиков.",
      detailedDescription: [
        "Цифровая схемотехника, архитектура компьютеров, ОС, сети и проектные семестры с индустриальными менторами.",
        "Лаборатории IoT и робототехники; выход в стажировки у партнёров в Алматы (описательно).",
      ],
      entryRequirements: ["Математика и физика", "IELTS 6.0+ для EN-track", "UNT/SAT для конкурса"],
    },
    {
      id: "sdu-bba-management",
      name: "B.B.A. in Management",
      facultyId: "sdu-bus",
      annualTuitionKzt: 3_400_000,
      field: "Business",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 79,
      matchReason:
        "Операции, HR и стратегия с кейсами кампусных стартапов и международными стажировками.",
      detailedDescription: [
        "Бизнес-модели, управление проектами, переговоры и лидерство; консалтинг-проекты для местных МСП.",
        "Элективы по digital marketing и продуктовому менеджменту.",
      ],
      entryRequirements: ["Математика в аттестате", "IELTS 6.0+", "Мотивационное эссе"],
    },
    {
      id: "sdu-llb-law-international",
      name: "LL.B. in International Law",
      facultyId: "sdu-law-soc",
      annualTuitionKzt: 3_100_000,
      field: "Law",
      degree: "Bachelor",
      durationYears: 4,
      language: "English",
      fitScore: 71,
      matchReason:
        "Международное право и трейд-лай — для поступающих с сильными гуманитарными навыками и английским.",
      detailedDescription: [
        "Публичное и частное международное право, инвестиционные споры, модели международных организаций.",
        "Moot courts на английском; языковая поддержка Legal Writing.",
      ],
      entryRequirements: ["IELTS 6.5+", "История / обществознание", "Внутренний экзамен или SAT Reading"],
    },
    {
      id: "sdu-barch-architecture",
      name: "B.Arch in Architecture",
      facultyId: "sdu-arch",
      annualTuitionKzt: 4_100_000,
      field: "Engineering",
      degree: "Bachelor",
      durationYears: 5,
      language: "Russian / English",
      fitScore: 77,
      matchReason:
        "Пятилетка с проектными ателье, урбанистикой и устойчивым строительством.",
      detailedDescription: [
        "Архитектурный дизайн, конструкции, BIM, история архитектуры Центральной Азии и Европы.",
        "Регулярные ревю портфолио и летние практики в бюро.",
      ],
      entryRequirements: ["Творческий конкурс / портфолио", "Математика и черчение", "Собеседование"],
    },
    {
      id: "sdu-ba-psychology",
      name: "B.A. in Psychology",
      facultyId: "sdu-law-soc",
      annualTuitionKzt: 2_650_000,
      field: "Social Sciences",
      degree: "Bachelor",
      durationYears: 4,
      language: "Russian",
      fitScore: 73,
      matchReason:
        "Когнитивная и социальная психология с практикой опросов и HR/коучинг-модулями.",
      detailedDescription: [
        "Статистика для психологов, психометрия, клиническое введение и организационная психология.",
        "Этика работы с клиентами; мост в магистратуру клинической и образовательной психологии.",
      ],
      entryRequirements: ["Биология и обществознание", "UNT", "Интервью на некоторые места"],
    },
    {
      id: "sdu-msc-digital-innovation",
      name: "MSc in Digital Innovation and Entrepreneurship",
      facultyId: "sdu-bus",
      annualTuitionKzt: 3_800_000,
      field: "Business",
      degree: "Master",
      durationYears: 2,
      language: "English",
      fitScore: 80,
      matchReason:
        "Для тех, кто хочет связать продукт, данные и запуск стартапа в одном магистерском треке.",
      detailedDescription: [
        "Lean startup, unit-экономика, инвестиционные питчи, работа с VC-симуляциями.",
        "Совместные проекты с IT-факультетом: MVP и go-to-market.",
      ],
      entryRequirements: ["Бакалавр любого профиля с конкурсным GPA", "IELTS 6.5+", "Интервью и мотивация"],
    },
  ],
};

const BASE_KAZAKHSTAN_UNIVERSITIES: UniversityTemplate[] = [
  UNIVERSITY_NU,
  UNIVERSITY_KBTU,
  UNIVERSITY_AITU,
  UNIVERSITY_KAZNU,
  UNIVERSITY_SDU,
];

/**
 * 10 вузов РК: 5 базовых (с расширенным каталогом факультетов из open data) + 5 из `newInstitutions`.
 * Единая «база» для поиска, дашборда и рекомендаций.
 */
export const UNIVERSITIES: UniversityTemplate[] = [
  ...mergeCatalogIntoUniversities(BASE_KAZAKHSTAN_UNIVERSITIES),
  ...ADDITIONAL_KAZAKHSTAN_UNIVERSITIES,
];

/** Обратная совместимость: первый вуз по умолчанию. */
export const universityData: UniversityTemplate = UNIVERSITY_NU;

export function getProgramBySlug(slug: string): ProgramLookup | undefined {
  for (const u of UNIVERSITIES) {
    const program = u.programs.find((p) => p.id === slug);
    if (program) return { university: u, program };
  }
  return undefined;
}
