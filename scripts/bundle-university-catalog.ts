/**
 * Собирает все src/catalog/universities/*.json (кроме _*) в universities.bundle.json для импорта из mockData и сервера.
 * Запуск после добавления/правки вуза: npm run catalog:bundle
 */
import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "src/catalog/universities");
const outFile = path.join(root, "src/catalog/universities.bundle.json");

const files = readdirSync(dir)
  .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
  .sort((a, b) => a.localeCompare(b));

const universities = files.map((f) => {
  const raw = readFileSync(path.join(dir, f), "utf-8");
  return JSON.parse(raw) as { id: string };
});

const ids = new Set<string>();
for (const u of universities) {
  if (ids.has(u.id)) throw new Error(`duplicate university id in catalog: ${u.id}`);
  ids.add(u.id);
}

universities.sort((a, b) => a.id.localeCompare(b.id));

writeFileSync(outFile, `${JSON.stringify(universities, null, 2)}\n`, "utf-8");
console.log(`bundled ${universities.length} universities → ${path.relative(root, outFile)}`);
