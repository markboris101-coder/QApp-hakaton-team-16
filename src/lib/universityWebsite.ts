import type { UniversityTemplate } from "../mockData";

/**
 * Запасные официальные сайты для вузов каталога, у которых в шаблоне не заполнено `officialWebsiteUrl`.
 * Не подставлять произвольные URL — только известные id; иначе UI ведёт на дашборд.
 */
export const FALLBACK_UNIVERSITY_WEBSITE_BY_ID: Record<string, string> = {
  nu: "https://nu.edu.kz/en/admissions",
  kbtu: "https://www.kbtu.kz/",
  aitu: "https://astanait.edu.kz/",
  kaznu: "https://www.kaznu.kz/",
  sdu: "https://sdu.edu.kz/",
  enu: "https://enu.kz/",
  satbayev: "https://satbayev.university/",
  abaikaznpu: "https://kaznpu.kz/",
  kaznaru: "https://kaznaru.kz/",
  nkzu: "https://nkzu.kz/",
  buketov: "https://buketov.edu.kz/",
  "zhubanov-aru": "https://zhubanov.edu.kz/",
  yessenov: "https://yu.edu.kz/",
  shakarim: "https://shakarim.university/",
  toraighyrov: "https://tou.edu.kz/",
  kimep: "https://www.kimep.kz/",
  turan: "https://www.turan-edu.kz/",
  knmu: "https://www.kaznmu.edu.kz/",
  semeymu: "https://smu.edu.kz/",
  astanamu: "https://amu.edu.kz/",
  kargtu: "https://ktu.edu.kz/",
  wkatu: "https://wku.edu.kz/",
  narxoz: "https://turan-astana.edu.kz/",
  kostanayu: "https://ksu.edu.kz/",
  tarzu: "https://www.tarzu.edu.kz/",
};

/** Внешняя ссылка на сайт вуза или `undefined`, если в демо нет проверенного URL. */
export function resolveUniversityExternalWebsite(
  u: Pick<UniversityTemplate, "id" | "officialWebsiteUrl">
): string | undefined {
  const fromField = u.officialWebsiteUrl?.trim();
  if (fromField) return fromField;
  const fallback = FALLBACK_UNIVERSITY_WEBSITE_BY_ID[u.id]?.trim();
  return fallback || undefined;
}
