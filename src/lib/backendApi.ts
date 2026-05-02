import type { StudentProfile } from "../mockData";

/**
 * База URL бэкенда. Локально пусто → относительные `/api/*` (прокси Vite).
 * В проде: `VITE_API_BASE_URL=https://your-api.onrender.com` (без слэша в конце).
 */
function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchServerProfile(): Promise<{ student: StudentProfile; source: string } | null> {
  try {
    const r = await fetch(apiUrl("/api/profile"));
    if (!r.ok) return null;
    return (await r.json()) as { student: StudentProfile; source: string };
  } catch {
    return null;
  }
}

export async function saveServerProfile(student: StudentProfile): Promise<boolean> {
  try {
    const r = await fetch(apiUrl("/api/profile"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export async function serverReachable(): Promise<boolean> {
  try {
    const r = await fetch(apiUrl("/api/health"));
    return r.ok;
  } catch {
    return false;
  }
}
