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
  /**
   * Олимпиада учитывается в fit score только после успешной AI-проверки загруженного PNG-сертификата.
   */
  olympiadVerified?: boolean;
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
  scholarships: ScholarshipInfo[];
  programs: UniversityProgram[];
  admissionExpectations: UniversityAdmissionExpectations;
}

export type ProgramLookup = { university: UniversityTemplate; program: UniversityProgram };

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

/** Все мок-вузы Казахстана для MVP (переключатель и поиск). */
export const UNIVERSITIES: UniversityTemplate[] = [UNIVERSITY_NU, UNIVERSITY_KBTU, UNIVERSITY_AITU];

/** Обратная совместимость: первый вуз по умолчанию. */
export const universityData: UniversityTemplate = UNIVERSITY_NU;

export function getProgramBySlug(slug: string): ProgramLookup | undefined {
  for (const u of UNIVERSITIES) {
    const program = u.programs.find((p) => p.id === slug);
    if (program) return { university: u, program };
  }
  return undefined;
}
