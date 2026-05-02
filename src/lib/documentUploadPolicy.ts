/**
 * Политика загрузки документов — Smart University Profile (MVP)
 * Проект: QApp · Impact Admissions × QApp 2026
 *
 * Поддерживаемые форматы: .pdf, .jpg, .jpeg, .png
 * Максимальный размер файла: 10 MB
 */

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"] as const;

/** MIME-типы, разрешённые для приёма */
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

/** Атрибут `accept` для input[type=file] */
export const DOCUMENT_FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

function hasAllowedExtension(fileName: string): boolean {
  return /\.(pdf|jpe?g|png)$/i.test(fileName);
}

/** Только PNG для сертификатов/олимпиады (отдельный поток загрузки). */
export function validateAchievementPng(file: File): ValidationResult {
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return {
      ok: false,
      message: `Файл слишком большой. Максимум ${Math.round(MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024))} MB.`,
    };
  }
  const okMime = file.type === "image/png" || (file.type === "" && /\.png$/i.test(file.name));
  if (!okMime) {
    return { ok: false, message: "Для достижений сейчас принимается только формат PNG." };
  }
  return { ok: true };
}

export function validateDocumentFile(file: File): ValidationResult {
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return {
      ok: false,
      message: `File is too large. Maximum size is ${Math.round(MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024))} MB.`,
    };
  }
  const mimeOk = ALLOWED_DOCUMENT_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number]
  );
  const emptyMimeButExtOk = file.type === "" && hasAllowedExtension(file.name);
  if (!mimeOk && !emptyMimeButExtOk) {
    return {
      ok: false,
      message: "Unsupported format. Use PDF, JPG, or PNG.",
    };
  }
  return { ok: true };
}
