import React, { useState } from "react";
import { motion } from "framer-motion";
import type { FinancialSituation, StudentProfile } from "../mockData";
import {
  clampGpa,
  clampSat,
  clampUnt,
  IELTS_HALF_BANDS,
  parseFloatBounded,
  parseIntBounded,
  roundIeltsHalfBand,
} from "../lib/academicInput";
import { INTEREST_OPTIONS } from "./ProfileEditorForm";
import { useProfile } from "../context/ProfileContext";

const FINANCIAL_OPTIONS: FinancialSituation[] = ["Need Full Scholarship", "Partial Scholarship", "Self-funded"];

const FINANCIAL_LABELS_RU: Record<FinancialSituation, string> = {
  "Need Full Scholarship": "Нужна полная стипендия",
  "Partial Scholarship": "Частичная стипендия / грант",
  "Self-funded": "Самооплата",
};

type Props = {
  onComplete: () => void;
};

export function AssistantIntakeForm({ onComplete }: Props) {
  const { setStudent } = useProfile();
  const [gpa, setGpa] = useState("");
  const [ielts, setIelts] = useState(String(IELTS_HALF_BANDS[14] ?? 6.5));
  const [sat, setSat] = useState("");
  const [unt, setUnt] = useState("");
  const [city, setCity] = useState("");
  const [financialStatus, setFinancialStatus] = useState<FinancialSituation>("Need Full Scholarship");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (opt: string) => {
    setInterests((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const gpaN = parseFloatBounded(gpa, 0, 5, NaN);
    if (!Number.isFinite(gpaN) || gpa.trim() === "") {
      setError("Укажите GPA по шкале до 5.0.");
      return;
    }

    const satN =
      sat.trim() === "" ? 0 : parseIntBounded(sat, 0, 1600, NaN);
    if (!Number.isFinite(satN)) {
      setError("SAT: введите число 0–1600 или оставьте поле пустым, если не сдавали.");
      return;
    }

    const untN = parseIntBounded(unt, 0, 140, NaN);
    if (!Number.isFinite(untN) || unt.trim() === "") {
      setError("Укажите балл ЕНТ / UNT (0–140) или 0.");
      return;
    }

    if (!city.trim()) {
      setError("Укажите город (или регион), где хотите учиться.");
      return;
    }

    if (interests.length === 0) {
      setError("Выберите хотя бы одно направление интересов.");
      return;
    }

    const ieltsN = roundIeltsHalfBand(Number.parseFloat(ielts));

    setStudent((prev: StudentProfile) => ({
      ...prev,
      academic: {
        ...prev.academic,
        gpa: clampGpa(gpaN),
        ielts: ieltsN,
        sat: clampSat(satN),
        untScore: clampUnt(untN),
      },
      preferences: {
        ...prev.preferences,
        city: city.trim(),
        financialStatus,
        interests,
      },
    }));

    onComplete();
  };

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border-2 border-indigo-200/90 bg-white p-6 shadow-xl shadow-indigo-100/40 ring-1 ring-indigo-100/80 sm:p-8"
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">Шаг 1 из 2</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Анкета абитуриента</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
        Чтобы ассистент мог <strong className="font-semibold text-slate-800">рекомендовать конкретный вуз</strong>, нужны
        ваши оценки, язык и предпочтения. Эти данные сохраняются в профиле и используются для расчёта AI Fit.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">GPA (до 5.0)</span>
            <input
              required
              type="text"
              inputMode="decimal"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              placeholder="например 4.5"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">IELTS</span>
            <select
              value={ielts}
              onChange={(e) => setIelts(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {IELTS_HALF_BANDS.map((b) => (
                <option key={b} value={String(b)}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">SAT (необязательно)</span>
            <input
              type="text"
              inputMode="numeric"
              value={sat}
              onChange={(e) => setSat(e.target.value)}
              placeholder="оставьте пустым, если не сдавали"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <span className="mt-1 block text-xs text-slate-500">Оценка шансов опирается на GPA и ЕНТ; SAT усиливает модель, если указан.</span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">ЕНТ / UNT</span>
            <input
              required
              type="text"
              inputMode="numeric"
              value={unt}
              onChange={(e) => setUnt(e.target.value)}
              placeholder="0–140"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Город / регион учёбы</span>
          <input
            required
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="например Астана или Алматы"
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </label>

        <div>
          <span className="text-sm font-medium text-slate-700">Финансирование</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {FINANCIAL_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFinancialStatus(f)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  financialStatus === f
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200/80"
                }`}
              >
                {FINANCIAL_LABELS_RU[f]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-slate-700">Интересы (минимум один)</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleInterest(opt)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  interests.includes(opt)
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200/80"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 sm:w-auto sm:px-10"
        >
          Сохранить и получить рекомендацию
        </button>
      </form>
    </motion.section>
  );
}
