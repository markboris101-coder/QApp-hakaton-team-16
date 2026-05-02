import type { UniversityTemplate } from "../../mockData";
import { EXTRA_FACULTIES_BY_UNIVERSITY_ID } from "./extraFaculties";

/**
 * Объединяет базовые записи вузов из mockData с расширенным каталогом факультетов
 * (открытые структуры / институты — QApp).
 */
export function mergeCatalogIntoUniversities(base: UniversityTemplate[]): UniversityTemplate[] {
  return base.map((u) => {
    const extra = EXTRA_FACULTIES_BY_UNIVERSITY_ID[u.id];
    if (!extra?.length) return u;
    const existingIds = new Set(u.faculties.map((f) => f.id));
    const merged = [...u.faculties];
    for (const f of extra) {
      if (!existingIds.has(f.id)) {
        merged.push(f);
        existingIds.add(f.id);
      }
    }
    return { ...u, faculties: merged };
  });
}
