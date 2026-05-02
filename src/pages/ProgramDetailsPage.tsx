import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { calculateFitScore } from "../calculateFitScore";
import { formatTuitionKzt, getFaculty, getProgramBySlug } from "../mockData";
import { useProfile } from "../context/ProfileContext";
import { useSmartAdvisor } from "../hooks/useSmartAdvisor";
import { TextSkeleton } from "../components/TextSkeleton";
import { isAiConfigured } from "../services/aiProvider";
import { formatSatForDisplay } from "../lib/academicInput";
import { getFacultyDescription, getFacultyDisplayName, getUniversityDisplayName } from "../lib/universityLabels";

const APPLY_URLS: Record<string, string> = {
  nu: "https://nu.edu.kz/en/admissions",
  kbtu: "https://www.kbtu.kz/",
  aitu: "https://astanait.edu.kz/",
  kaznu: "https://www.kaznu.kz/",
  sdu: "https://sdu.edu.kz/",
  enu: "https://enu.kz/",
  satbayev: "https://satbayev.university/",
  abaikaznpu: "https://kaznpu.kz/",
  kaznaru: "https://kaznaru.kz/",
  nkzu: "https://nkzu.kz/",
  buketov: "https://buketov.edu.kz/",
  "zhubanov-aru": "https://zhubanov.edu.kz/",
  yessenov: "https://yu.edu.kz/",
  shakarim: "https://shakarim.university/",
  toraighyrov: "https://tou.edu.kz/",
};

export function ProgramDetailsPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { student, toggleShortlist, isShortlisted, setSelectedUniversityId } = useProfile();
  const { getProgramAdvice } = useSmartAdvisor();

  const result = useMemo(() => (id ? getProgramBySlug(id) : undefined), [id]);
  const program = result?.program;
  const programUniversity = result?.university;

  const [insight, setInsight] = useState<string>("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  useEffect(() => {
    if (result) setSelectedUniversityId(result.university.id);
  }, [result, setSelectedUniversityId]);

  useEffect(() => {
    setInsight("");
    setInsightError(null);
  }, [id]);

  const requestInsight = useCallback(async () => {
    if (!program) return;
    setInsightLoading(true);
    setInsightError(null);
    setInsight("");
    if (!isAiConfigured()) {
      setInsight(t("program.insightNoKey"));
      setInsightLoading(false);
      return;
    }
    try {
      const text = await getProgramAdvice(program.id);
      setInsight(text);
    } catch (e) {
      setInsightError(e instanceof Error ? e.message : t("program.insightFail"));
    } finally {
      setInsightLoading(false);
    }
  }, [program, getProgramAdvice, t]);

  if (!result || !program || !programUniversity) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">{t("program.notFound")}</h1>
        <p className="mt-2 text-slate-600">{t("program.notFoundHint")}</p>
        <Link to="/" className="mt-6 inline-block font-medium text-indigo-600 hover:text-indigo-800">
          {t("program.backHome")}
        </Link>
      </div>
    );
  }

  const yearsLabel = t("programMeta.years", { count: program.durationYears });

  const { score, englishWarning } = calculateFitScore(
    student,
    program,
    programUniversity.admissionExpectations
  );
  const shortlisted = isShortlisted(program.id);
  const applyHref = APPLY_URLS[programUniversity.id] ?? "https://www.gov.kz";
  const faculty = getFaculty(programUniversity, program.facultyId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="mx-auto w-full max-w-[min(100%,1400px)] px-4 py-8 sm:px-6 lg:py-12"
    >
      <section className="mb-8 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm ring-1 ring-slate-100/80 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">{t("program.yourProfile")}</span>
            <span>GPA {student.academic.gpa.toFixed(1)}</span>
            <span>SAT {formatSatForDisplay(student.academic.sat)}</span>
            <span>UNT {student.academic.untScore}/140</span>
            <span>IELTS {student.academic.ielts.toFixed(1)}</span>
            <span className="max-w-xs truncate text-slate-600">{student.preferences.financialStatus}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/profile"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              {t("program.editData")}
            </Link>
            <Link
              to="/dashboard#admission-checklist"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              {t("program.checklist")}
            </Link>
            <Link
              to="/dashboard#program-grid"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              {t("program.allPrograms")}
            </Link>
          </div>
        </div>
      </section>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav className="text-sm text-slate-500">
          <Link to="/dashboard" className="font-medium text-indigo-600 hover:text-indigo-800">
            {t("program.breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-600">{getUniversityDisplayName(programUniversity, i18n.language)}</span>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{program.name}</span>
        </nav>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          {t("program.back")}
        </button>
      </div>

      <div className="flex flex-col gap-10">
        <div className="min-w-0 space-y-8">
          <header className="overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white to-indigo-50/50 p-6 shadow-sm sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              {getUniversityDisplayName(programUniversity, i18n.language)} · {programUniversity.city}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{program.name}</h1>
            <p className="mt-2 text-slate-600">
              {t("program.degreeLine", {
                field: program.field,
                degree: program.degree,
                years: yearsLabel,
                language: program.language,
              })}
            </p>
            {faculty && (
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">{t("program.faculty")} </span>
                {getFacultyDisplayName(faculty, i18n.language)}
              </p>
            )}
            <p className="mt-2 text-sm font-medium text-emerald-900 tabular-nums">
              {t("program.costMock")} {formatTuitionKzt(program.annualTuitionKzt)}
            </p>
            <p className="mt-1 text-sm text-slate-500">{program.matchReason}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-white shadow-md">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-300">AI fit</span>
                <span className="text-2xl font-bold tabular-nums">{score}%</span>
              </div>
              {englishWarning && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900 ring-1 ring-amber-200">
                  {englishWarning}
                </span>
              )}
            </div>
          </header>

          {faculty && (
            <section className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5">
              <h2 className="text-lg font-semibold text-slate-900">{t("program.aboutFaculty")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {getFacultyDescription(faculty, i18n.language)}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Вилка по вузу: {programUniversity.tuitionOverview.note}
              </p>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold text-slate-900">{t("program.aboutProgram")}</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-600">
              {program.detailedDescription.map((p, idx) => (
                <li key={idx} className="pl-1">
                  {p}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">{t("program.entryRequirements")}</h2>
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t("program.qwenTitle")}</h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-violet-700">
                  {t("program.qwenSub")}
                </p>
              </div>
              <button
                type="button"
                onClick={requestInsight}
                disabled={insightLoading}
                className="shrink-0 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {insight ? t("program.refreshInsight") : t("program.getInsight")}
              </button>
            </div>
            {insightLoading ? (
              <div className="mt-4">
                <TextSkeleton lines={4} />
              </div>
            ) : insightError ? (
              <p className="mt-3 text-sm text-red-700">{insightError}</p>
            ) : insight ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{insight}</p>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                {t("program.insightEmpty")}
              </p>
            )}
            <p className="mt-3 text-xs text-slate-500">
              SAT {formatSatForDisplay(student.academic.sat)}, UNT/ЕНТ {student.academic.untScore}/140, GPA{" "}
              {student.academic.gpa.toFixed(1)}.
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
              {shortlisted ? t("program.removeShortlist") : t("program.addShortlist")}
            </button>
            <a
              href={applyHref}
              target="_blank"
              rel="noreferrer"
              className="flex-1 rounded-2xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
            >
              {t("program.applySite")}
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
