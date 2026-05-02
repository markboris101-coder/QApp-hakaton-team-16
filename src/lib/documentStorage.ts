import type { DocumentUploadMeta, StudentDocuments, StudentProfile } from "../mockData";

/** Имя БД не меняем — сохраняем уже загруженные файлы пользователей после апдейта. */
const DB_NAME = "smart-university-profile-docs";
const DB_VERSION = 3;
const STORE_DOCS = "documents";
const STORE_PROFILE = "profile";
const STORE_ACHIEVEMENTS = "achievements";

export type AchievementCategory = "olympiad" | "other";

export interface AchievementStored {
  id: string;
  category: AchievementCategory;
  meta: DocumentUploadMeta;
  blob: Blob;
  aiVerdict?: string;
  aiCheckedAt?: string;
}

const PROFILE_ROW_ID = "student_profile";

export type DocumentKey = keyof StudentDocuments;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        db.createObjectStore(STORE_DOCS, { keyPath: "key" });
      }
      if (oldVersion < 2 && !db.objectStoreNames.contains(STORE_PROFILE)) {
        db.createObjectStore(STORE_PROFILE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_ACHIEVEMENTS)) {
        db.createObjectStore(STORE_ACHIEVEMENTS, { keyPath: "id" });
      }
    };
  });
}

/** Обёртка для файлов: ключ документа + мета + blob */
type Row = { key: DocumentKey; meta: DocumentUploadMeta; blob: Blob };

type ProfileRow = { id: string; profile: StudentProfile };

export async function putDocument(key: DocumentKey, file: File): Promise<DocumentUploadMeta> {
  const meta: DocumentUploadMeta = {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
  };
  const blob = file.slice(0, file.size, file.type);
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, "readwrite");
    const store = tx.objectStore(STORE_DOCS);
    const row: Row = { key, meta, blob };
    const req = store.put(row);
    req.onerror = () => reject(req.error ?? new Error("put failed"));
    req.onsuccess = () => resolve(meta);
    tx.oncomplete = () => db.close();
  });
}

export async function getDocumentFile(key: DocumentKey): Promise<File | null> {
  const row = await getRow(key);
  if (!row) return null;
  return new File([row.blob], row.meta.fileName, {
    type: row.meta.mimeType,
    lastModified: new Date(row.meta.uploadedAt).getTime(),
  });
}

async function getRow(key: DocumentKey): Promise<Row | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, "readonly");
    const store = tx.objectStore(STORE_DOCS);
    const req = store.get(key);
    req.onerror = () => reject(req.error ?? new Error("get failed"));
    req.onsuccess = () => {
      const row = req.result as Row | undefined;
      resolve(row ?? null);
    };
    tx.oncomplete = () => db.close();
  });
}

export async function getDocumentMeta(key: DocumentKey): Promise<DocumentUploadMeta | null> {
  const row = await getRow(key);
  return row?.meta ?? null;
}

export async function deleteDocument(key: DocumentKey): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, "readwrite");
    const store = tx.objectStore(STORE_DOCS);
    const req = store.delete(key);
    req.onerror = () => reject(req.error ?? new Error("delete failed"));
    req.onsuccess = () => resolve();
    tx.oncomplete = () => db.close();
  });
}

export async function listStoredDocumentKeys(): Promise<DocumentKey[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, "readonly");
    const store = tx.objectStore(STORE_DOCS);
    const req = store.getAllKeys();
    req.onerror = () => reject(req.error ?? new Error("list keys failed"));
    req.onsuccess = () => {
      resolve((req.result as DocumentKey[]) ?? []);
    };
    tx.oncomplete = () => db.close();
  });
}

/** Сохранение профиля (без бинарников — только JSON-сериализуемые поля). ТЗ: состояние между перезагрузками. */
export async function saveStudentProfile(profile: StudentProfile): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROFILE, "readwrite");
    const store = tx.objectStore(STORE_PROFILE);
    const row: ProfileRow = { id: PROFILE_ROW_ID, profile };
    const req = store.put(row);
    req.onerror = () => reject(req.error ?? new Error("profile put failed"));
    req.onsuccess = () => resolve();
    tx.oncomplete = () => db.close();
  });
}

export async function loadStudentProfile(): Promise<StudentProfile | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROFILE, "readonly");
    const store = tx.objectStore(STORE_PROFILE);
    const req = store.get(PROFILE_ROW_ID);
    req.onerror = () => reject(req.error ?? new Error("profile get failed"));
    req.onsuccess = () => {
      const row = req.result as ProfileRow | undefined;
      resolve(row?.profile ?? null);
    };
    tx.oncomplete = () => db.close();
  });
}

/** Стартовое состояние: сохранённый профиль + синхронизация файлов из хранилища документов. */
export async function loadMergedStudent(defaultProfile: StudentProfile): Promise<StudentProfile> {
  let base: StudentProfile;
  try {
    const saved = await loadStudentProfile();
    base = saved ?? defaultProfile;
  } catch {
    base = defaultProfile;
  }

  try {
    const keys = await listStoredDocumentKeys();
    if (keys.length === 0) return base;
    const nextUploads = { ...(base.documentUploads ?? {}) };
    const nextDocs = { ...base.documents };
    for (const key of keys) {
      const meta = await getDocumentMeta(key);
      if (meta) {
        nextDocs[key] = "READY";
        nextUploads[key] = meta;
      }
    }
    return { ...base, documents: nextDocs, documentUploads: nextUploads };
  } catch {
    return base;
  }
}

// -----------------------------------------------------------------------------
// Сертификаты и достижения (PNG и др.) — отдельное хранилище
// -----------------------------------------------------------------------------

export async function putAchievement(
  file: File,
  category: AchievementCategory
): Promise<{ id: string; meta: DocumentUploadMeta }> {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `ach-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const meta: DocumentUploadMeta = {
    fileName: file.name,
    mimeType: file.type || "image/png",
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
  };
  const blob = file.slice(0, file.size, file.type);
  const row: AchievementStored = { id, category, meta, blob };
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ACHIEVEMENTS, "readwrite");
    const store = tx.objectStore(STORE_ACHIEVEMENTS);
    const req = store.put(row);
    req.onerror = () => reject(req.error ?? new Error("achievement put failed"));
    req.onsuccess = () => resolve({ id, meta });
    tx.oncomplete = () => db.close();
  });
}

export async function deleteAchievement(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ACHIEVEMENTS, "readwrite");
    const store = tx.objectStore(STORE_ACHIEVEMENTS);
    const req = store.delete(id);
    req.onerror = () => reject(req.error ?? new Error("achievement delete failed"));
    req.onsuccess = () => resolve();
    tx.oncomplete = () => db.close();
  });
}

export async function listAchievements(): Promise<AchievementStored[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ACHIEVEMENTS, "readonly");
    const store = tx.objectStore(STORE_ACHIEVEMENTS);
    const req = store.getAll();
    req.onerror = () => reject(req.error ?? new Error("achievement list failed"));
    req.onsuccess = () => {
      resolve((req.result as AchievementStored[]) ?? []);
    };
    tx.oncomplete = () => db.close();
  });
}

export async function saveAchievementVerdict(id: string, verdict: string): Promise<void> {
  const existing = await getAchievementById(id);
  if (!existing) return;
  const updated: AchievementStored = {
    ...existing,
    aiVerdict: verdict,
    aiCheckedAt: new Date().toISOString(),
  };
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ACHIEVEMENTS, "readwrite");
    const store = tx.objectStore(STORE_ACHIEVEMENTS);
    const req = store.put(updated);
    req.onerror = () => reject(req.error ?? new Error("achievement verdict save failed"));
    req.onsuccess = () => resolve();
    tx.oncomplete = () => db.close();
  });
}

async function getAchievementById(id: string): Promise<AchievementStored | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ACHIEVEMENTS, "readonly");
    const store = tx.objectStore(STORE_ACHIEVEMENTS);
    const req = store.get(id);
    req.onerror = () => reject(req.error ?? new Error("achievement get failed"));
    req.onsuccess = () => resolve((req.result as AchievementStored | undefined) ?? null);
    tx.oncomplete = () => db.close();
  });
}

/** Есть ли среди записей подтверждённая олимпиада (ACCEPT). */
export async function hasVerifiedOlympiadCertificate(): Promise<boolean> {
  const rows = await listAchievements();
  return rows.some(
    (r) =>
      r.category === "olympiad" &&
      r.aiVerdict &&
      /VERDICT\s*:\s*ACCEPT/i.test(r.aiVerdict)
  );
}
