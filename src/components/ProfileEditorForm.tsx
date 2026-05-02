import React, { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { FinancialSituation, StudentProfile } from "../mockData";
import {
  clampGpa,
  clampSat,
  clampUnt,
  IELTS_HALF_BANDS,
  parseIntBounded,
  parseFloatBounded,
  roundIeltsHalfBand,
  SAT_MAX,
  SAT_MIN,
  UNT_MAX,
  UNT_MIN,
  GPA_MAX,
  GPA_MIN,
} from "../lib/academicInput";
import { validateAchievementPng } from "../lib/documentUploadPolicy";
import {
  deleteAchievement,
  hasVerifiedOlympiadCertificate,
  listAchievements,
  putAchievement,
  saveAchievementVerdict,
  type AchievementCategory,
  type AchievementStored,
} from "../lib/documentStorage";
import { parseAchievementVerdict } from "../lib/achievementVerdict";
import { isAiConfigured, verifyAchievementCertificateImage } from "../services/aiProvider";

export const INTEREST_OPTIONS = [
  "Computer Science",
  "STEM",
  "Business",
  "Engineering",
  "Science",
  "Law",
  "Humanities",
  "Social Sciences",
  "Medicine",
] as const;

const FINANCIAL_OPTIONS: FinancialSituation[] = [
  "Need Full Scholarship",
  "Partial Scholarship",
  "Self-funded",
];

export const AWARD_OPTIONS = [
  "Olympiad Winner",
  "Sports Achievement",
  "Volunteering Leader",
  "Research Project",
  "Arts Excellence",
] as const;

type Props = {
  student: StudentProfile;
  onStudentChange: Dispatch<SetStateAction<StudentProfile>>;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export function ProfileEditorForm({ student, onStudentChange }: Props) {
  const [achievements, setAchievements] = useState<AchievementStored[]>([]);
  const [verifyBusyId, setVerifyBusyId] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState<AchievementCategory>("olympiad");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshAchievements = useCallback(async () => {
    try {
      const list = await listAchievements();
      setAchievements(list);
    } catch (e) {
      console.warn(e);
      setAchievements([]);
    }
  }, []);

  const afterAchievementMutate = useCallback(async () => {
    await refreshAchievements();
    const ok = await hasVerifiedOlympiadCertificate();
    onStudentChange((prev) => {
      const hasAward = prev.awards.some((a) => /olympiad/i.test(a));
      if (!hasAward) return prev.olympiadVerified ? { ...prev, olympiadVerified: false } : prev;
      return { ...prev, olympiadVerified: ok };
    });
  }, [refreshAchievements, onStudentChange]);

  useEffect(() => {
    void afterAchievementMutate();
  }, [afterAchievementMutate]);

  const toggleInterest = (label: string, checked: boolean) => {
    const set = new Set(student.preferences.interests);
    if (checked) set.add(label);
    else set.delete(label);
    onStudentChange({
      ...student,
      preferences: { ...student.preferences, interests: Array.from(set) },
    });
  };

  const toggleAward = (label: string, checked: boolean) => {
    const set = new Set(student.awards);
    if (checked) set.add(label);
    else set.delete(label);
    const nextAwards = Array.from(set);
    const olympiadUnchecked = label === "Olympiad Winner" && !checked;
    onStudentChange({
      ...student,
      awards: nextAwards,
      ...(olympiadUnchecked ? { olympiadVerified: false } : {}),
    });
  };

  const setGpa = (raw: string) => {
    const v = clampGpa(parseFloatBounded(raw, GPA_MIN, GPA_MAX, student.academic.gpa));
    onStudentChange({ ...student, academic: { ...student.academic, gpa: v } });
  };

  const setIelts = (band: number) => {
    onStudentChange({
      ...student,
      academic: { ...student.academic, ielts: band },
    });
  };

  const setSat = (raw: string) => {
    const v = clampSat(parseIntBounded(raw, SAT_MIN, SAT_MAX, student.academic.sat));
    onStudentChange({ ...student, academic: { ...student.academic, sat: v } });
  };

  const setUnt = (raw: string) => {
    const v = clampUnt(parseIntBounded(raw, UNT_MIN, UNT_MAX, student.academic.untScore));
    onStudentChange({ ...student, academic: { ...student.academic, untScore: v } });
  };

  const setFinancial = (value: FinancialSituation) => {
    onStudentChange({
      ...student,
      preferences: { ...student.preferences, financialStatus: value },
    });
  };

  const handlePickAchievementFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const v = validateAchievementPng(file);
    if (!v.ok) {
      window.alert(v.message);
      return;
    }
    try {
      await putAchievement(file, uploadCategory);
      await afterAchievementMutate();
    } catch (err) {
      console.error(err);
      window.alert("Не удалось сохранить файл.");
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    try {
      await deleteAchievement(id);
      await afterAchievementMutate();
    } catch (err) {
      console.error(err);
      window.alert("Не удалось удалить файл.");
    }
  };

  const handleVerifyAchievement = async (row: AchievementStored) => {
    if (!isAiConfigured()) {
      window.alert("Добавьте VITE_API_KEY (локально или на хостинге), чтобы Qwen проверил сертификат.");
      return;
    }
    setVerifyBusyId(row.id);
    try {
      const file = new File([row.blob], row.meta.fileName, { type: row.meta.mimeType });
      const dataUrl = await readFileAsDataUrl(file);
      const text = await verifyAchievementCertificateImage(dataUrl, row.category);
      await saveAchievementVerdict(row.id, text);
      await afterAchievementMutate();
      const verdict = parseAchievementVerdict(text);
      if (verdict === "unknown") {
        window.alert(
          "Модель ответила без строки VERDICT. Проверьте текст вердикта в карточке — при необходимости нажмите «Проверить» ещё раз."
        );
      }
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Ошибка проверки");
    } finally {
      setVerifyBusyId(null);
    }
  };

  const hasOlympiadAward = student.awards.some((a) => /olympiad/i.test(a));

  const fieldClass =
    "mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm lg:col-span-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Академические показатели</h3>
        <div className="mt-6 space-y-6">
          <section>
            <label className="block text-sm font-medium text-slate-700" htmlFor="gpa-input">
              GPA (out of 5.0)
            </label>
            <input
              id="gpa-input"
              type="number"
              step="0.1"
              min={GPA_MIN}
              max={GPA_MAX}
              value={student.academic.gpa}
              onChange={(e) => setGpa(e.target.value)}
              className={fieldClass}
            />
          </section>
          <section>
            <label className="block text-sm font-medium text-slate-700" htmlFor="sat-input">
              SAT ({SAT_MIN}–{SAT_MAX})
            </label>
            <input
              id="sat-input"
              type="number"
              inputMode="numeric"
              min={SAT_MIN}
              max={SAT_MAX}
              value={student.academic.sat}
              onChange={(e) => setSat(e.target.value)}
              className={fieldClass}
            />
          </section>
          <section>
            <label className="block text-sm font-medium text-slate-700" htmlFor="unt-input">
              UNT / ЕНТ ({UNT_MIN}–{UNT_MAX})
            </label>
            <input
              id="unt-input"
              type="number"
              inputMode="numeric"
              min={UNT_MIN}
              max={UNT_MAX}
              value={student.academic.untScore}
              onChange={(e) => setUnt(e.target.value)}
              className={fieldClass}
            />
          </section>
          <section>
            <label className="block text-sm font-medium text-slate-700" htmlFor="ielts-select">
              IELTS (шаг 0.5)
            </label>
            <select
              id="ielts-select"
              value={roundIeltsHalfBand(student.academic.ielts)}
              onChange={(e) => setIelts(Number(e.target.value))}
              className={fieldClass}
            >
              {IELTS_HALF_BANDS.map((band) => (
                <option key={band} value={band}>
                  {band % 1 === 0 ? `${band}.0` : band}
                </option>
              ))}
            </select>
            {student.academic.ielts < 6.5 && (
              <p className="mt-2 text-sm text-amber-700">
                Warning: low English level — program fit is heavily reduced.
              </p>
            )}
          </section>
        </div>
      </div>

      <div className="space-y-8 lg:col-span-7">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Финансы и интересы</h3>
          <p className="mt-2 text-sm font-medium text-slate-700">Financial situation</p>
          <div className="mt-3 space-y-2">
            {FINANCIAL_OPTIONS.map((opt) => (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
              >
                <input
                  type="radio"
                  name="financial"
                  className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={student.preferences.financialStatus === opt}
                  onChange={() => setFinancial(opt)}
                />
                <span className="text-sm text-slate-800">{opt}</span>
              </label>
            ))}
          </div>
          <p className="mt-8 text-sm font-medium text-slate-700">Interests</p>
          <p className="mt-1 text-xs text-slate-500">Сопоставляются с полем программы (Engineering, Business и т.д.).</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {INTEREST_OPTIONS.map((option) => {
              const checked = student.preferences.interests.includes(option);
              return (
                <li key={option}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={checked}
                      onChange={(e) => toggleInterest(option, e.target.checked)}
                    />
                    <span className="text-sm text-slate-800">{option}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Награды и сертификаты</h3>
          <p className="mt-2 text-xs text-slate-500">
            Бонус «Olympiad» в Fit только при PNG и VERDICT: ACCEPT от Qwen VL.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {AWARD_OPTIONS.map((option) => {
              const checked = student.awards.includes(option);
              return (
                <li key={option}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={checked}
                      onChange={(e) => toggleAward(option, e.target.checked)}
                    />
                    <span className="text-sm text-slate-800">{option}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          {hasOlympiadAward && (
            <p
              className={`mt-4 rounded-lg px-3 py-2 text-xs leading-relaxed ${
                student.olympiadVerified
                  ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100"
                  : "bg-amber-50 text-amber-950 ring-1 ring-amber-200"
              }`}
            >
              {student.olympiadVerified
                ? "Олимпиада подтверждена AI — бонус к Fit активен."
                : "Загрузите PNG и нажмите «Проверить через Qwen» (VERDICT: ACCEPT)."}
            </p>
          )}

          <p className="mt-8 text-sm font-medium text-slate-700">Сертификаты (PNG)</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as AchievementCategory)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
            >
              <option value="olympiad">Олимпиада</option>
              <option value="other">Другое достижение</option>
            </select>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              className="hidden"
              onChange={handlePickAchievementFile}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-100"
            >
              Загрузить PNG
            </button>
          </div>
          <ul className="mt-4 grid gap-4 lg:grid-cols-2">
            {achievements.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{row.meta.fileName}</p>
                    <p className="text-xs text-slate-500">
                      {row.category === "olympiad" ? "Олимпиада" : "Другое"} ·{" "}
                      {(row.meta.sizeBytes / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAchievement(row.id)}
                    className="shrink-0 text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    Удалить
                  </button>
                </div>
                {row.aiVerdict ? (
                  <div className="mt-2 rounded-lg bg-white px-2 py-2 text-xs leading-relaxed text-slate-700 ring-1 ring-slate-100">
                    <p className="font-medium text-slate-800">Вердикт модели</p>
                    <p className="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap">{row.aiVerdict}</p>
                    <p className="mt-2 text-[11px] uppercase text-slate-400">
                      Разбор:{" "}
                      <span className="font-semibold text-slate-700">
                        {parseAchievementVerdict(row.aiVerdict)}
                      </span>
                    </p>
                  </div>
                ) : null}
                <button
                  type="button"
                  disabled={verifyBusyId === row.id}
                  onClick={() => handleVerifyAchievement(row)}
                  className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {verifyBusyId === row.id ? "Проверка…" : "Проверить через Qwen (vision)"}
                </button>
              </li>
            ))}
          </ul>
          {achievements.length === 0 && (
            <p className="mt-3 text-xs text-slate-400">Пока нет загруженных файлов.</p>
          )}
        </div>
      </div>
    </div>
  );
}
