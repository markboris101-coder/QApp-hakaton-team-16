import type { StudentDocuments } from "../mockData";
import { DOCUMENT_ENTRIES, DOCUMENT_LANE_ORDER, type DocumentLane } from "../components/documentLabels";

export function daysUntilDeadlineIso(iso: string): number {
  const end = new Date(iso.includes("T") ? iso : `${iso}T23:59:59`);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export type DocsInsight =
  | { kind: "complete" }
  | { kind: "deadlinePassed"; missingCount: number }
  | { kind: "critical"; daysLeft: number; missingCount: number }
  | { kind: "soon"; daysLeft: number; missingCount: number }
  | { kind: "steady"; daysLeft: number; missingCount: number };

export function computeDocsInsight(documents: StudentDocuments, daysLeft: number): DocsInsight {
  const total = DOCUMENT_ENTRIES.length;
  const ready = DOCUMENT_ENTRIES.filter((e) => documents[e.key] === "READY").length;
  if (ready === total) return { kind: "complete" };

  const missingCount = DOCUMENT_ENTRIES.filter((e) => documents[e.key] === "MISSING").length;

  if (daysLeft < 0) return { kind: "deadlinePassed", missingCount };

  if (daysLeft <= 7 && missingCount > 0) return { kind: "critical", daysLeft, missingCount };
  if (daysLeft <= 30 && missingCount > 0) return { kind: "soon", daysLeft, missingCount };
  return { kind: "steady", daysLeft, missingCount };
}

/**
 * Рекомендуемый следующий файл: учитывает «узкие места» (медицина при близком дедлайне)
 * и логичный порядок сбора пакета.
 */
export function pickRecommendedDocument(documents: StudentDocuments, daysLeft: number): keyof StudentDocuments | null {
  const missingKeys = new Set(
    DOCUMENT_ENTRIES.filter((e) => documents[e.key] === "MISSING").map((e) => e.key)
  );
  if (missingKeys.size === 0) return null;

  const medicalMissing = missingKeys.has("medicalCertificate");
  if (medicalMissing && daysLeft >= 0 && daysLeft <= 21) return "medicalCertificate";

  const chain: (keyof StudentDocuments)[] = [
    "passport",
    "academicTranscript",
    "diploma",
    "photo3x4",
    "medicalCertificate",
  ];
  for (const k of chain) {
    if (missingKeys.has(k)) return k;
  }
  return [...missingKeys][0] ?? null;
}

export function entriesGroupedByLane(filter: "all" | "missing" | "ready", documents: StudentDocuments) {
  const passes = (e: DocumentEntryMeta) => {
    const st = documents[e.key];
    if (filter === "all") return true;
    if (filter === "missing") return st === "MISSING" || st === "PENDING";
    return st === "READY";
  };

  return DOCUMENT_LANE_ORDER.map((lane) => ({
    lane,
    items: DOCUMENT_ENTRIES.filter((e) => e.lane === lane && passes(e)).sort((a, b) => a.priority - b.priority),
  })).filter((g) => g.items.length > 0);
}

export function countDocumentStates(documents: StudentDocuments) {
  let ready = 0;
  let missing = 0;
  let pending = 0;
  for (const e of DOCUMENT_ENTRIES) {
    const st = documents[e.key];
    if (st === "READY") ready++;
    else if (st === "MISSING") missing++;
    else pending++;
  }
  return { ready, missing, pending, total: DOCUMENT_ENTRIES.length };
}
