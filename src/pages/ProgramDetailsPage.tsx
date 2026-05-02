import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { calculateFitScore } from "../calculateFitScore";
import { getProgramBySlug, universityData } from "../mockData";
import { StudentQuickSidebar } from "../components/StudentQuickSidebar";
import { useProfile } from "../context/ProfileContext";
import { useSmartAdvisor } from "../hooks/useSmartAdvisor";
import { TextSkeleton } from "../components/TextSkeleton";
import { isAiConfigured } from "../services/aiProvider";

export function ProgramDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { student, toggleShortlist, isShortlisted } = useProfile();
  const { getProgramAdvice } = useSmartAdvisor();

  const [insight, setInsight] = useState<string>("");
  const [insightLoading, setInsightLoading] = useState(true);
  const [insightError, setInsightError] = useState<string | null>(null);

  const program = id ? getProgramBySlug(id) : undefined;

  useEffect(() => {
    if (!id) return;
    const prog = getProgramBySlug(id);
    if (!prog) {
      setInsightLoading(false);
      setInsight("");
      setInsightError(null);
      return;
    }

    let cancelled = false;
    setInsightLoading(true);
    setInsightError(null);
    setInsight("");

    if (!isAiConfigured()) {
      setInsight(
        "Добавьте ключ `VITE_API_KEY` в файл `.env.local` и перезапустите `npm run dev`, чтобы получить персональный совет от модели Qwen 2.5."
      );
      setInsightLoading(false);
      return;
    }

    (async () => {
      try {
        const text = await getProgramAdvice(prog.id);
        if (!cancelled) setInsight(text);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Не удалось получить ответ ИИ.";
        if (!cancelled) setInsightError(msg);
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, getProgramAdvice]);

  if (!program) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Program not found</h1>
        <p className="mt-2 text-slate-600">Check the link or return to the program grid.</p>
        <Link to="/" className="mt-6 inline-block font-medium text-indigo-600 hover:text-indigo-800">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const { score, englishWarning } = calculateFitScore(student, program);
  const shortlisted = isShortlisted(program.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="mx-auto max-w-6xl px-4 py-8 lg:py-12"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav className="text-sm text-slate-500">
          <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-800">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{program.name}</span>
        </nav>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back
        </button>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-8">
          <header className="overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white to-indigo-50/50 p-6 shadow-sm sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              {universityData.name}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{program.name}</h1>
            <p className="mt-2 text-slate-600">
              {program.field} · {program.degree} · {program.durationYears} years · {program.language}
            </p>
            <p className="mt-3 text-sm text-slate-500">{program.matchReason}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-white shadow-md">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-300">Your fit</span>
                <span className="text-2xl font-bold tabular-nums">{score}%</span>
              </div>
              {englishWarning && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900 ring-1 ring-amber-200">
                  {englishWarning}
                </span>
              )}
            </div>
          </header>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">About this program</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-600">
              {program.detailedDescription.map((p, idx) => (
                <li key={idx} className="pl-1">
                  {p}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Entry requirements</h2>
            <ul className="mt-3 space-y-2">
              {program.entryRequirements.map((req) => (
                <li
                  key={req}
                  className="flex gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm text-slate-800"
                >
                  <span className="text-indigo-500" aria-hidden>
                    •
                  </span>
                  {req}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-violet-200/80 bg-violet-50/50 p-5 ring-1 ring-violet-100">
            <h2 className="text-lg font-semibold text-slate-900">Your match insight</h2>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-violet-700">Qwen 2.5 · QApp</p>
            {insightLoading ? (
              <div className="mt-4">
                <TextSkeleton lines={4} />
              </div>
            ) : insightError ? (
              <p className="mt-3 text-sm text-red-700">{insightError}</p>
            ) : (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{insight}</p>
            )}
            <p className="mt-3 text-xs text-slate-500">
              SAT {student.academic.sat}, UNT/ЕНТ {student.academic.untScore}/140, GPA {student.academic.gpa.toFixed(1)}.
            </p>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => toggleShortlist(program.id)}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition ${
                shortlisted
                  ? "border-2 border-amber-400 bg-amber-50 text-amber-950"
                  : "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {shortlisted ? "Remove from shortlist" : "Add to shortlist"}
            </button>
            <a
              href="https://nu.edu.kz/en/admissions"
              target="_blank"
              rel="noreferrer"
              className="flex-1 rounded-2xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
            >
              Start application
            </a>
          </div>
        </div>

        <div className="w-full shrink-0 lg:max-w-sm">
          <StudentQuickSidebar />
        </div>
      </div>
    </motion.div>
  );
}
