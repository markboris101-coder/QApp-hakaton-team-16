/**
 * Лёгкая демо-аналитика в localStorage (без бекенда) — для воронки и пика прогресса чек-листа.
 */

const STORAGE_KEY = "qapp-demo-analytics-v1";

export type DemoAnalyticsState = {
  v: 1;
  landingVisits: number;
  intakeCompleted: number;
  dashboardVisits: number;
  profileVisits: number;
  blogVisits: number;
  checklistReadyPeak: number;
  shortlistPeak: number;
  lastEventAt: string;
};

function defaults(): DemoAnalyticsState {
  return {
    v: 1,
    landingVisits: 0,
    intakeCompleted: 0,
    dashboardVisits: 0,
    profileVisits: 0,
    blogVisits: 0,
    checklistReadyPeak: 0,
    shortlistPeak: 0,
    lastEventAt: new Date().toISOString(),
  };
}

function load(): DemoAnalyticsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const p = JSON.parse(raw) as Partial<DemoAnalyticsState>;
    if (p.v !== 1) return defaults();
    return { ...defaults(), ...p, v: 1 };
  } catch {
    return defaults();
  }
}

function save(next: DemoAnalyticsState): void {
  try {
    next.lastEventAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

export function getDemoAnalytics(): DemoAnalyticsState {
  return load();
}

export function resetDemoAnalytics(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function bump(patch: Partial<DemoAnalyticsState>): void {
  const s = load();
  save({ ...s, ...patch });
}

export function bumpLandingVisit(): void {
  const s = load();
  bump({ landingVisits: s.landingVisits + 1 });
}

export function recordIntakeCompleted(): void {
  const s = load();
  bump({ intakeCompleted: s.intakeCompleted + 1 });
}

export function bumpDashboardVisit(): void {
  const s = load();
  bump({ dashboardVisits: s.dashboardVisits + 1 });
}

export function bumpProfileVisit(): void {
  const s = load();
  bump({ profileVisits: s.profileVisits + 1 });
}

export function bumpBlogVisit(): void {
  const s = load();
  bump({ blogVisits: s.blogVisits + 1 });
}

export function recordChecklistReadyPeak(readyCount: number): void {
  const s = load();
  const n = Math.max(0, Math.min(99, Math.round(readyCount)));
  if (n <= s.checklistReadyPeak) return;
  bump({ checklistReadyPeak: n });
}

export function recordShortlistPeak(shortlistLen: number): void {
  const s = load();
  const n = Math.max(0, Math.round(shortlistLen));
  if (n <= s.shortlistPeak) return;
  bump({ shortlistPeak: n });
}
