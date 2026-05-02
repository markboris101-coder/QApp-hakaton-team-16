/**
 * Smart University Profile — Single Source of Truth для frontend-прототипа (хакатон QApp).
 */

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
  /** SAT Total 0–1600 */
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

/** Полный профиль текущего пользователя-абитуриента */
export interface StudentProfile {
  academic: StudentAcademic;
  preferences: StudentPreferences;
  documents: StudentDocuments;
  /** Награды и достижения (строки из пресетов или свои) */
  awards: string[];
  documentUploads?: Partial<Record<keyof StudentDocuments, DocumentUploadMeta>>;
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

/** Учебная программа вуза */
export interface UniversityProgram {
  /** Slug для URL `/program/:id` */
  id: string;
  name: string;
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

export interface UniversityTemplate {
  name: string;
  city: string;
  foundedYear: number;
  type: UniversityType;
  languagesOfInstruction: string[];
  applicationDeadline: string;
  scholarships: ScholarshipInfo[];
  programs: UniversityProgram[];
}

export function getProgramBySlug(slug: string): UniversityProgram | undefined {
  return universityData.programs.find((p) => p.id === slug);
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

export const universityData: UniversityTemplate = {
  name: "Nazarbayev University",
  city: "Astana",
  foundedYear: 2010,
  type: "Research",
  languagesOfInstruction: ["English"],
  applicationDeadline: "2026-04-15",
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
      id: "bsc-computer-science",
      name: "BSc in Computer Science",
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
      id: "bsc-robotics-mechatronics",
      name: "BSc in Robotics and Mechatronics",
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
      id: "bsc-data-science",
      name: "BSc in Data Science",
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
      id: "ba-economics",
      name: "B.A. in Economics",
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
      id: "bsc-biological-sciences",
      name: "BSc in Biological Sciences",
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
      id: "ba-political-science-ir",
      name: "B.A. in Political Science and International Relations",
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
