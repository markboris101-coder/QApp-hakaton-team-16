import type { DegreeLevel, UniversityTemplate } from "../mockData";
import { formatTuitionBand, formatTuitionKzt } from "../mockData";

const DEGREE_ORDER: DegreeLevel[] = ["Bachelor", "Master", "PhD"];

const DEGREE_RU: Record<DegreeLevel, string> = {
  Bachelor: "Бакалавриат",
  Master: "Магистратура",
  PhD: "Докторантура",
};

function truncateText(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export type UniversityCompareSnapshot = {
  cityShort: string;
  cityFull: string;
  countryPart: string;
  ageYears: number;
  degreeBreakdownRu: string;
  degreeBreakdownShort: string;
  fieldsUnique: string;
  programTuitionMinMax: string;
  avgDurationYears: string;
  programLanguages: string;
  facultiesCount: number;
  facultyNamesShort: string;
  facultyNamesLong: string;
  admissionCompact: string;
  admissionNoteShort: string;
  scholarshipsListed: number;
  scholarshipNamesLine: string;
  highRelevanceCount: number;
  stipendPreview: string;
};

export function buildUniversitySnapshot(u: UniversityTemplate, refYear = new Date().getFullYear()): UniversityCompareSnapshot {
  const programs = u.programs;
  const tuitions = programs.map((p) => p.annualTuitionKzt);
  const minT = tuitions.length ? Math.min(...tuitions) : 0;
  const maxT = tuitions.length ? Math.max(...tuitions) : 0;
  const avgDur =
    programs.length > 0 ? programs.reduce((s, p) => s + p.durationYears, 0) / programs.length : 0;

  const degreeCounts = DEGREE_ORDER.map((d) => ({
    degree: d,
    n: programs.filter((p) => p.degree === d).length,
  })).filter((x) => x.n > 0);

  const degreeBreakdownRu =
    degreeCounts.length > 0
      ? degreeCounts.map(({ degree, n }) => `${DEGREE_RU[degree]}: ${n}`).join(" · ")
      : "—";

  const degreeBreakdownShort =
    degreeCounts.length > 0 ? degreeCounts.map(({ n }) => String(n)).join(" / ") : "—";

  const fields = [...new Set(programs.map((p) => p.field))];
  const langsProg = [...new Set(programs.map((p) => p.language))];

  const ae = u.admissionExpectations;
  const admissionCompact = `IELTS ≥ ${ae.minIelts} · GPA от ${ae.competitiveGpa}/${ae.gpaScaleMax} · SAT от ${ae.competitiveSat} · UNT от ${ae.competitiveUnt}`;

  const highRel = u.scholarships.filter((s) => s.aiRelevance === "High").length;
  const namesLine = u.scholarships.map((s) => s.name).join("; ");
  const stipendPreview = u.scholarships
    .slice(0, 2)
    .map((s) => `${s.name}: ${truncateText(s.requirements, 90)}`)
    .join("\n");

  const parts = u.city.split(",").map((s) => s.trim());
  const cityShort = parts[0] ?? u.city;
  const countryPart = parts.length > 1 ? parts.slice(1).join(", ") : "—";

  const fn = u.faculties.map((f) => f.name);
  const facultyNamesShort =
    fn.length <= 2 ? fn.join("; ") : `${fn.slice(0, 2).join("; ")}; +ещё ${fn.length - 2}`;
  const facultyNamesLong = truncateText(fn.join("; "), 320);

  const programTuitionMinMax =
    programs.length > 0 ? `${formatTuitionKzt(minT)} — ${formatTuitionKzt(maxT)}` : "—";

  return {
    cityShort,
    cityFull: u.city,
    countryPart,
    ageYears: Math.max(0, refYear - u.foundedYear),
    degreeBreakdownRu,
    degreeBreakdownShort,
    fieldsUnique: fields.length ? fields.join(", ") : "—",
    programTuitionMinMax,
    avgDurationYears: programs.length ? avgDur.toFixed(1).replace(/\.0$/, "") : "—",
    programLanguages: langsProg.length ? langsProg.join(", ") : "—",
    facultiesCount: u.faculties.length,
    facultyNamesShort,
    facultyNamesLong,
    admissionCompact,
    admissionNoteShort: truncateText(ae.modelNote, 160),
    scholarshipsListed: u.scholarships.length,
    scholarshipNamesLine: truncateText(namesLine, 200),
    highRelevanceCount: highRel,
    stipendPreview,
  };
}

export function formatDeadlineRu(iso: string): string {
  const d = new Date(iso + (iso.includes("T") ? "" : "T12:00:00"));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export function buildRichCompareClipboardText(universities: UniversityTemplate[]): string {
  const lines: string[] = [
    "Сравнение вузов — QApp University Hub",
    `Сгенерировано: ${new Date().toLocaleString("ru-RU")}`,
    "",
  ];
  for (const u of universities) {
    const s = buildUniversitySnapshot(u);
    lines.push(
      `━━ ${u.name} ━━`,
      `Город: ${s.cityFull} (${s.countryPart})`,
      `Тип: ${u.type} · основан в ${u.foundedYear} (~${s.ageYears} лет)`,
      `Дедлайн заявки: ${formatDeadlineRu(u.applicationDeadline)}`,
      `Контракт (вуз, ориентир): ${formatTuitionBand(u.tuitionOverview)}`,
      `Диапазон по программам: ${s.programTuitionMinMax}`,
      `Примечание к цене: ${u.tuitionOverview.note}`,
      `Программ всего: ${u.programs.length} (${s.degreeBreakdownRu})`,
      `Направления (поля): ${s.fieldsUnique}`,
      `Средняя длительность программы: ${s.avgDurationYears} лет`,
      `Языки на программах: ${s.programLanguages}`,
      `Языки кампуса: ${u.languagesOfInstruction.join(", ")}`,
      `Факультетов/школ: ${s.facultiesCount} — ${s.facultyNamesLong}`,
      `Поступление (модель): ${s.admissionCompact}`,
      `Комментарий модели: ${u.admissionExpectations.modelNote}`,
      `Стипендии в каталоге: ${s.scholarshipsListed} (высокая релевантность AI: ${s.highRelevanceCount})`,
      `Названия: ${u.scholarships.map((x) => x.name).join("; ")}`,
      `Обзор стипендий: ${u.scholarshipBlurb}`,
      "",
    );
  }
  return lines.join("\n");
}

export type CompareRowDef = {
  id: string;
  label: string;
  /** Если true — строка скрыта в режиме «Кратко» */
  detail?: boolean;
  section: CompareSectionId;
  pick: (u: UniversityTemplate, snap: UniversityCompareSnapshot) => string;
  title?: (u: UniversityTemplate, snap: UniversityCompareSnapshot) => string | undefined;
};

export type CompareSectionId = "general" | "finance" | "programs" | "structure" | "admission" | "scholarships";

export const COMPARE_SECTION_LABELS: Record<CompareSectionId, string> = {
  general: "Общие сведения",
  finance: "Сроки и стоимость",
  programs: "Программы обучения",
  structure: "Структура вуза",
  admission: "Поступление (модель Fit)",
  scholarships: "Стипендии и гранты",
};

export const COMPARE_SECTION_ORDER: CompareSectionId[] = [
  "general",
  "finance",
  "programs",
  "structure",
  "admission",
  "scholarships",
];

export const COMPARE_TABLE_ROWS: CompareRowDef[] = [
  {
    id: "city",
    section: "general",
    label: "Город (кратко)",
    pick: (_, s) => s.cityShort,
  },
  {
    id: "city_full",
    section: "general",
    label: "Адрес / регион",
    detail: true,
    pick: (_, s) => `${s.cityFull}`,
    title: (_, s) => s.cityFull,
  },
  {
    id: "country",
    section: "general",
    detail: true,
    label: "Страна / регион",
    pick: (_, s) => s.countryPart,
  },
  {
    id: "type",
    section: "general",
    label: "Тип вуза",
    pick: (u) => u.type,
  },
  {
    id: "founded",
    section: "general",
    label: "Год основания",
    pick: (u) => String(u.foundedYear),
  },
  {
    id: "age",
    section: "general",
    label: "Лет с основания",
    pick: (_, s) => String(s.ageYears),
  },
  {
    id: "campus_lang",
    section: "general",
    label: "Языки кампуса",
    pick: (u) => u.languagesOfInstruction.join(", ") || "—",
  },
  {
    id: "deadline",
    section: "finance",
    label: "Дедлайн заявки",
    pick: (u) => formatDeadlineRu(u.applicationDeadline),
  },
  {
    id: "tuition_band",
    section: "finance",
    label: "Контракт вуза (ориентир)",
    pick: (u) => formatTuitionBand(u.tuitionOverview),
  },
  {
    id: "tuition_minmax",
    section: "finance",
    label: "Мин–макс ₸ (вуз)",
    pick: (u) => `${formatTuitionKzt(u.tuitionOverview.minKzt)} — ${formatTuitionKzt(u.tuitionOverview.maxKzt)}`,
  },
  {
    id: "tuition_note",
    section: "finance",
    detail: true,
    label: "Примечание к цене",
    pick: (u) => truncateText(u.tuitionOverview.note, 140),
    title: (u) => u.tuitionOverview.note,
  },
  {
    id: "prog_tuition",
    section: "finance",
    label: "Диапазон по программам",
    pick: (_, s) => s.programTuitionMinMax,
    title: (u) => {
      const programs = u.programs;
      if (!programs.length) return undefined;
      const slugs = [...programs]
        .sort((a, b) => a.annualTuitionKzt - b.annualTuitionKzt)
        .slice(0, 3)
        .map((p) => `${p.name}: ${formatTuitionKzt(p.annualTuitionKzt)}`);
      return slugs.join("\n");
    },
  },
  {
    id: "prog_count",
    section: "programs",
    label: "Всего программ",
    pick: (u) => String(u.programs.length),
  },
  {
    id: "degrees",
    section: "programs",
    label: "Бак / Маг / Док (число)",
    pick: (_, s) => s.degreeBreakdownShort,
    title: (_, s) => s.degreeBreakdownRu,
  },
  {
    id: "degrees_ru",
    section: "programs",
    detail: true,
    label: "Уровни подготовки",
    pick: (_, s) => s.degreeBreakdownRu,
  },
  {
    id: "fields",
    section: "programs",
    label: "Направления (поля программ)",
    pick: (_, s) => s.fieldsUnique,
    title: (u) =>
      [...new Set(u.programs.map((p) => p.field))]
        .map((f) => {
          const n = u.programs.filter((p) => p.field === f).length;
          return `${f}: ${n}`;
        })
        .join("\n"),
  },
  {
    id: "avg_dur",
    section: "programs",
    detail: true,
    label: "Средняя длительность (лет)",
    pick: (_, s) => (s.avgDurationYears === "—" ? "—" : `${s.avgDurationYears} лет`),
  },
  {
    id: "prog_lang",
    section: "programs",
    label: "Языки на программах",
    pick: (_, s) => s.programLanguages,
  },
  {
    id: "fac_count",
    section: "structure",
    label: "Факультетов / школ",
    pick: (_, s) => String(s.facultiesCount),
  },
  {
    id: "fac_names",
    section: "structure",
    detail: true,
    label: "Подразделения",
    pick: (_, s) => s.facultyNamesShort,
    title: (u) => u.faculties.map((f) => `${f.name}: ${truncateText(f.description, 120)}`).join("\n\n"),
  },
  {
    id: "admission_line",
    section: "admission",
    label: "Ориентиры отбора",
    pick: (_, s) => s.admissionCompact,
    title: (u) => u.admissionExpectations.modelNote,
  },
  {
    id: "admission_note",
    section: "admission",
    detail: true,
    label: "Комментарий модели",
    pick: (_, s) => s.admissionNoteShort,
    title: (u) => u.admissionExpectations.modelNote,
  },
  {
    id: "sch_blurb",
    section: "scholarships",
    label: "Обзор стипендий (текст)",
    pick: (u) => truncateText(u.scholarshipBlurb, 130),
    title: (u) => u.scholarshipBlurb,
  },
  {
    id: "sch_count",
    section: "scholarships",
    label: "Позиций в каталоге",
    pick: (_, s) => String(s.scholarshipsListed),
  },
  {
    id: "sch_high",
    section: "scholarships",
    label: "Высокая релевантность (AI)",
    pick: (_, s) => String(s.highRelevanceCount),
  },
  {
    id: "sch_names",
    section: "scholarships",
    detail: true,
    label: "Названия программ",
    pick: (_, s) => s.scholarshipNamesLine,
    title: (u) => u.scholarships.map((x) => x.name).join("; "),
  },
  {
    id: "sch_preview",
    section: "scholarships",
    detail: true,
    label: "Примеры требований",
    pick: (_, s) => truncateText(s.stipendPreview.replace(/\n/g, " · "), 160),
    title: (_, s) => s.stipendPreview,
  },
];
