import React from "react";
import type { FinancialSituation, StudentProfile } from "../mockData";

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
  open: boolean;
  onClose: () => void;
  student: StudentProfile;
  onStudentChange: (next: StudentProfile) => void;
};

export function StudentProfileEditor({ open, onClose, student, onStudentChange }: Props) {
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
    onStudentChange({ ...student, awards: Array.from(set) });
  };

  const setGpa = (value: number) => {
    onStudentChange({ ...student, academic: { ...student.academic, gpa: value } });
  };

  const setIelts = (value: number) => {
    onStudentChange({ ...student, academic: { ...student.academic, ielts: value } });
  };

  const setSat = (value: number) => {
    onStudentChange({ ...student, academic: { ...student.academic, sat: value } });
  };

  const setUnt = (value: number) => {
    onStudentChange({ ...student, academic: { ...student.academic, untScore: value } });
  };

  const setFinancial = (value: FinancialSituation) => {
    onStudentChange({
      ...student,
      preferences: { ...student.preferences, financialStatus: value },
    });
  };

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close profile editor"
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-editor-title"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="profile-editor-title" className="text-lg font-semibold text-slate-900">
            Profile assistant
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6">
          <section>
            <label className="block text-sm font-medium text-slate-700" htmlFor="gpa-input">
              GPA (out of 5.0)
            </label>
            <input
              id="gpa-input"
              type="number"
              step="0.1"
              min={0}
              max={5}
              value={student.academic.gpa}
              onChange={(e) => setGpa(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </section>

          <section>
            <label className="block text-sm font-medium text-slate-700" htmlFor="sat-input">
              SAT Score (0–1600)
            </label>
            <input
              id="sat-input"
              type="number"
              min={0}
              max={1600}
              value={student.academic.sat}
              onChange={(e) => setSat(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </section>

          <section>
            <label className="block text-sm font-medium text-slate-700" htmlFor="unt-input">
              UNT / ЕНТ (0–140)
            </label>
            <input
              id="unt-input"
              type="number"
              min={0}
              max={140}
              value={student.academic.untScore}
              onChange={(e) => setUnt(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </section>

          <section>
            <label className="block text-sm font-medium text-slate-700" htmlFor="ielts-input">
              IELTS
            </label>
            <input
              id="ielts-input"
              type="number"
              step="0.5"
              min={0}
              max={9}
              value={student.academic.ielts}
              onChange={(e) => setIelts(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {student.academic.ielts < 6.5 && (
              <p className="mt-2 text-sm text-amber-700">
                Warning: low English level — program fit is heavily reduced.
              </p>
            )}
          </section>

          <section>
            <p className="text-sm font-medium text-slate-700">Financial situation</p>
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
          </section>

          <section>
            <p className="text-sm font-medium text-slate-700">Awards &amp; highlights</p>
            <p className="mt-1 text-xs text-slate-500">Olympiad Winner adds STEM fit for Science/Engineering programs.</p>
            <ul className="mt-3 space-y-2">
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
          </section>

          <section>
            <p className="text-sm font-medium text-slate-700">Interests</p>
            <p className="mt-1 text-xs text-slate-500">
              Matched against each program&apos;s field (Engineering, Business, etc.).
            </p>
            <ul className="mt-3 space-y-2">
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
          </section>
        </div>
      </aside>
    </>
  );
}
