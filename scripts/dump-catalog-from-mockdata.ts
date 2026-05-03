/**
 * Одноразово выгружает текущий UNIVERSITIES из mockData в отдельные JSON (до рефакторинга mockData).
 * Запуск: npx tsx scripts/dump-catalog-from-mockdata.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { UNIVERSITIES } from "../src/mockData.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "src/catalog/universities");

mkdirSync(outDir, { recursive: true });
for (const u of UNIVERSITIES) {
  const safeId = u.id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const file = path.join(outDir, `${safeId}.json`);
  writeFileSync(file, `${JSON.stringify(u, null, 2)}\n`, "utf-8");
  console.log("wrote", safeId);
}
console.log("done:", UNIVERSITIES.length, "files →", outDir);
