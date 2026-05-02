import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { calculateFitScore } from "../calculateFitScore";
import { AdmissionChecklist } from "../components/AdmissionChecklist";
import { DeadlinesTimeline } from "../components/DeadlinesTimeline";
import { ScholarshipsSection } from "../components/ScholarshipsSection";
import { AiFitCard } from "../components/AiFitCard";
import { ProgramGrid } from "../components/ProgramGrid";
import { useSmartAdvisor } from "../hooks/useSmartAdvisor";
import { DashboardStickySidebar } from "../components/DashboardStickySidebar";
import { isAiConfigured } from "../services/aiProvider";
import * as documentStorage from "../lib/documentStorage";
import { validateDocumentFile } from "../lib/documentUploadPolicy";
import { useProfile } from "../context/ProfileContext";
import type { StudentDocuments } from "../mockData";

function formatShortDate(iso: string): string {
  const d = new Date(iso + (iso.includes("T") ? "" : "T12:00:00"));
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function FitRing({ value, gradientId = "heroFitGradient" }: { value: number; gradientId?: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">AI fit</p>
      </div>
    </div>
  );
}

export function HomePage() {
  const location = useLocation();
  const { student, setStudent, universityData, selectedUniversityId } = useProfile();
  const { getGeneralFitAdvice } = useSmartAdvisor();

  const [execSummary, setExecSummary] = useState("");
  const [execLoading, setExecLoading] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);

  const requestExecutive = useCallback(async () => {
    setExecLoading(true);
    setExecError(null);
    if (!isAiConfigured()) {
      setExecSummary(
        "Добавьте переменную `VITE_API_KEY` в `.env.local` (локально) или в настройках хостинга (production), затем перезапустите dev-сервер или передеплойте — чтобы Qwen 2.5 сформировал обзор."
      );
      setExecLoading(false);
      return;
    }
    try {
      const text = await getGeneralFitAdvice();
      setExecSummary(text);
    } catch (e) {
      setExecError(e instanceof Error ? e.message : "Ошибка ИИ");
    } finally {
      setExecLoading(false);
    }
  }, [getGeneralFitAdvice]);

  useEffect(() => {
    setExecSummary("");
    setExecError(null);
  }, [selectedUniversityId]);

  useEffect(() => {
    if (location.hash === "#admission-checklist" || location.hash === "#program-grid") {
      const el = document.querySelector(location.hash);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.pathname, location.hash]);

  const programResults = useMemo(
    () =>
      universityData.programs.map((program) => {
        const { score, englishWarning } = calculateFitScore(
          student,
          program,
          universityData.admissionExpectations
        );
        return { program, score, englishWarning };
      }),
    [student, universityData]
  );

  const averageFit = useMemo(() => {
    if (programResults.length === 0) return 0;
    const sum = programResults.reduce((acc, p) => acc + p.score, 0);
    return Math.round(sum / programResults.length);
  }, [programResults]);

  const instructionLanguages = universityData.languagesOfInstruction.join(" · ");

  const handleDocumentSelectFile = useCallback(
    async (key: keyof StudentDocuments, file: File) => {
      const v = validateDocumentFile(file);
      if (!v.ok) {
        window.alert(v.message);
        return;
      }
      if (typeof indexedDB === "undefined") {
        window.alert("Your browser does not support local file storage (IndexedDB).");
        return;
      }

      setStudent((s) => ({
        ...s,
        documents: { ...s.documents, [key]: "PENDING" },
      }));

      try {
        const meta = await documentStorage.putDocument(key, file);
        setStudent((s) => ({
          ...s,
          documents: { ...s.documents, [key]: "READY" },
          documentUploads: { ...(s.documentUploads ?? {}), [key]: meta },
        }));
      } catch (e) {
        console.error(e);
        setStudent((s) => ({
          ...s,
          documents: { ...s.documents, [key]: "MISSING" },
        }));
        window.alert("Could not save the file locally. Please try again.");
      }
    },
    [setStudent]
  );

  const handleDocumentRemoveFile = useCallback(
    async (key: keyof StudentDocuments) => {
      try {
        if (typeof indexedDB !== "undefined") {
          await documentStorage.deleteDocument(key);
        }
      } catch (e) {
        console.error(e);
      }
      setStudent((s) => {
        const nextUploads = { ...(s.documentUploads ?? {}) };
        delete nextUploads[key];
        return {
          ...s,
          documents: { ...s.documents, [key]: "MISSING" },
          documentUploads: nextUploads,
        };
      });
    },
    [setStudent]
  );

  const handleDocumentDownload = useCallback(
    async (key: keyof StudentDocuments) => {
      const file = await documentStorage.getDocumentFile(key);
      if (!file) {
        window.alert("File not found in local storage.");
        return;
      }
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    },
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900"
    >
      <header className="relative overflow-hidden border-b border-slate-200/80">
        <div
          className="absolute inset-0 bg-cover bg-center transition-[background-image] duration-500"
          style={{
            backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0.93) 0%, rgba(248,250,252,0.9) 42%, rgba(238,242,255,0.85) 100%), url(${universityData.heroImageUrl})`,
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex w-full max-w-[min(100%,1400px)] flex-col gap-8 px-4 py-10 backdrop-blur-[1px] sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-5">
            <div>
              <p className="text-sm font-medium text-indigo-600">Smart University Profile · QApp MVP</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {universityData.name}
              </h1>
              <p className="mt-2 text-slate-600">{universityData.city}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-800 ring-1 ring-slate-200/90 shadow-sm">
                Основан: {universityData.foundedYear}
              </span>
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-800 ring-1 ring-slate-200/90 shadow-sm">
                Языки: {instructionLanguages}
              </span>
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-800 ring-1 ring-slate-200/90 shadow-sm">
                Тип: {universityData.type}
              </span>
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-800 ring-1 ring-slate-200/90 shadow-sm">
                Программ: {universityData.programs.length}
              </span>
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-violet-900 ring-1 ring-violet-200 shadow-sm">
                Дедлайн {formatShortDate(universityData.applicationDeadline)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800 ring-1 ring-inset ring-indigo-100">
                GPA {student.academic.gpa.toFixed(1)}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800 ring-1 ring-slate-200/80">
                SAT {student.academic.sat}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800 ring-1 ring-slate-200/80">
                UNT {student.academic.untScore}/140
              </span>
              <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800 ring-1 ring-inset ring-violet-100">
                IELTS {student.academic.ielts.toFixed(1)}
              </span>
              {student.preferences.interests.map((i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200/60"
                >
                  {i}
                </span>
              ))}
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/35 p-4 ring-1 ring-indigo-100/90">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Стипендии (шаблон MVP)</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-800">{universityData.scholarshipBlurb}</p>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                Персональный текст от Qwen запускается кнопкой в блоке{" "}
                <a href="/#ai-fit-card" className="font-medium text-indigo-700 underline-offset-2 hover:underline">
                  AI Fit
                </a>{" "}
                — без автоматических запросов к API.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start lg:flex-col lg:items-end">
            <FitRing value={averageFit} />
            <div className="flex w-full max-w-xs flex-col gap-2 sm:flex-row sm:justify-end lg:flex-col lg:items-stretch">
              <Link
                to="/profile"
                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 sm:w-auto lg:w-full"
              >
                Полный профиль
              </Link>
              <Link
                to="/#program-grid"
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-center text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200/80 transition hover:bg-slate-50 sm:w-auto lg:w-full"
              >
                Программы
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[min(100%,1400px)] px-4 py-10 sm:px-6">
        <section className="mb-10 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm ring-1 ring-slate-100/80 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Кратко о профиле</span>
              <span>GPA {student.academic.gpa.toFixed(1)}</span>
              <span>SAT {student.academic.sat}</span>
              <span>UNT {student.academic.untScore}/140</span>
              <span>IELTS {student.academic.ielts.toFixed(1)}</span>
              <span className="max-w-xs truncate text-slate-600">{student.preferences.financialStatus}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/profile"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Изменить данные
              </Link>
              <Link
                to="/#admission-checklist"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-100"
              >
                Чек-лист
              </Link>
              <Link
                to="/#program-grid"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Программы
              </Link>
            </div>
          </div>
        </section>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-10">
          <div className="min-w-0 space-y-14">
            <AiFitCard
              universityName={universityData.name}
              averageFitPercent={averageFit}
              student={student}
              executiveSummary={execSummary}
              executiveLoading={execLoading}
              executiveError={execError}
              onRequestExecutiveSummary={requestExecutive}
              admissionExpectations={universityData.admissionExpectations}
            />
            <ProgramGrid rows={programResults} />

            <div className="space-y-14">
              <DeadlinesTimeline
                applicationDeadlineIso={universityData.applicationDeadline}
                documents={student.documents}
              />
              <AdmissionChecklist
                documents={student.documents}
                documentUploads={student.documentUploads ?? {}}
                onSelectFile={handleDocumentSelectFile}
                onRemoveFile={handleDocumentRemoveFile}
                onDownloadFile={handleDocumentDownload}
              />
              <ScholarshipsSection />
            </div>
          </div>
          <div className="mt-10 hidden lg:mt-0 lg:block">
            <DashboardStickySidebar
              universityName={universityData.name}
              city={universityData.city}
              averageFitPercent={averageFit}
              programCount={universityData.programs.length}
              student={student}
            />
          </div>
        </div>
      </main>
    </motion.div>
  );
}
