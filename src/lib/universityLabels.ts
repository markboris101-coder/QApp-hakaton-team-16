import type { UniversityFaculty, UniversityTemplate } from "../mockData";

function localeNorm(lang: string): "kk" | "ru" | "en" {
  if (lang.startsWith("kk")) return "kk";
  if (lang.startsWith("ru")) return "ru";
  return "en";
}

/** Отображаемое название вуза с учётом выбранного языка интерфейса. */
export function getUniversityDisplayName(u: UniversityTemplate, lang: string): string {
  const l = localeNorm(lang);
  if (l === "kk" && u.nameKk) return u.nameKk;
  if (l === "ru" && u.nameRu) return u.nameRu;
  return u.name;
}

/** Отображаемое название факультета. */
export function getFacultyDisplayName(f: UniversityFaculty, lang: string): string {
  const l = localeNorm(lang);
  if (l === "kk" && f.nameKk) return f.nameKk;
  if (l === "ru" && f.nameRu) return f.nameRu;
  return f.name;
}

/** Описание факультета на языке интерфейса (fallback — поле `description`, обычно EN). */
export function getFacultyDescription(f: UniversityFaculty, lang: string): string {
  const l = localeNorm(lang);
  if (l === "kk" && f.descriptionKk) return f.descriptionKk;
  if (l === "ru" && f.descriptionRu) return f.descriptionRu;
  return f.description;
}

/** Строка для поиска по вузу (все доступные названия). */
export function universitySearchBlob(u: UniversityTemplate): string {
  return [u.name, u.nameRu, u.nameKk, u.city, u.type, u.scholarshipBlurb, u.languagesOfInstruction.join(" "), String(u.foundedYear)]
    .filter(Boolean)
    .join(" ");
}
