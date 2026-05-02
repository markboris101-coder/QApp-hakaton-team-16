import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { StudentProfile } from "../src/mockData";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const PROFILE_PATH = path.join(DATA_DIR, "profile.json");

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readProfileFile(): StudentProfile | null {
  ensureDir();
  if (!fs.existsSync(PROFILE_PATH)) return null;
  try {
    const raw = fs.readFileSync(PROFILE_PATH, "utf-8");
    return JSON.parse(raw) as StudentProfile;
  } catch {
    return null;
  }
}

export function writeProfileFile(profile: StudentProfile): void {
  ensureDir();
  fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2), "utf-8");
}
