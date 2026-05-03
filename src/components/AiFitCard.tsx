import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type {
  StudentDocuments,
  StudentProfile,
  UniversityAdmissionExpectations,
} from "../mockData";
import { getFitMatchTier } from "../lib/fitMatchTier";
import { DOCUMENT_ENTRIES } from "./documentLabels";
import { TextSkeleton } from "./TextSkeleton";
import { isAiConfigured } from "../services/aiProvider";

function docLineLabel(lang: string, en: string, ru: string): string {
  if (lang.startsWith("kk") || lang.startsWith("ru")) return ru;
  return en;
}

type Props = {
  universityName: string;
  averageFitPercent: number;
  student: StudentProfile;
  documents: StudentDocuments;
  /** Есть ли пересечение интересов студента с полем программ вуза */
  programsInterestMatch: boolean;
  /** Запрос getGeneralFitAdvice только по кнопке с родителя */
  executiveSummary: string;
  executiveLoading: boolean;
  executiveError: string | null;
  onRequestExecutiveSummary: () => void;
  admissionExpectations: UniversityAdmissionExpectations;
};

export function AiFitCard({
  universityName,
  averageFitPercent,
  student,
  documents,
  programsInterestMatch,
  executiveSummary,
  executiveLoading,
  executiveError,
  onRequestExecutiveSummary,
  admissionExpectations: exp,
}: Props) {
  const { t, i18n } = useTranslation();
  const gpa = student.academic.gpa;
  const ielts = student.academic.ielts;
  const sat = student.academic.sat;
  const unt = student.academic.untScore;
  const gpaBoost = gpa >= exp.strongGpa;
  const gpaCompetitive = gpa >= exp.competitiveGpa;
  const englishOk = ielts >= exp.minIelts;
  const tier = getFitMatchTier(averageFitPercent);

  const missingDocs = useMemo(
    () =>
      DOCUMENT_ENTRIES.filter(({ key }) => documents[key] === "MISSING").map((e) =>
        docLineLabel(i18n.language, e.label, e.labelRu)
      ),
    [documents, i18n.language]
  );

  const pendingDocs = useMemo(
    () =>
      DOCUMENT_ENTRIES.filter(({ key }) => documents[key] === "PENDING").map((e) =>
        docLineLabel(i18n.language, e.label, e.labelRu)
      ),
    [documents, i18n.language]
  );

  const strengths = useMemo(() => {
    const lines: string[] = [];
    if (gpaBoost) lines.push(t("aiFit.strength.gpaStrong", { gpa: gpa.toFixed(1), scale: exp.gpaScaleMax.toFixed(1) }));
    else if (gpaCompetitive)
      lines.push(t("aiFit.strength.gpaOk", { gpa: gpa.toFixed(1), scale: exp.gpaScaleMax.toFixed(1) }));
    if (englishOk) lines.push(t("aiFit.strength.ieltsOk", { score: ielts.toFixed(1) }));
    if (unt >= exp.competitiveUnt)
      lines.push(t("aiFit.strength.untOk", { score: unt, threshold: exp.competitiveUnt }));
    if (programsInterestMatch) lines.push(t("aiFit.strength.interests"));
    if (student.awards.length > 0)
      lines.push(t("aiFit.strength.awards", { list: student.awards.join(", ") }));
    if (lines.length === 0) lines.push(t("aiFit.strength.generic"));
    return lines;
  }, [t, gpa, gpaBoost, gpaCompetitive, englishOk, ielts, unt, exp, programsInterestMatch, student.awards]);

  const gaps = useMemo(() => {
    const lines: string[] = [];
    if (!gpaCompetitive)
      lines.push(
        t("aiFit.gap.gpa", {
          gpa: gpa.toFixed(1),
          need: exp.competitiveGpa.toFixed(1),
        })
      );
    if (!englishOk) lines.push(t("aiFit.gap.ielts", { min: exp.minIelts }));
    if (sat > 0 && sat < exp.competitiveSat)
      lines.push(t("aiFit.gap.sat", { sat, need: exp.competitiveSat }));
    if (unt < exp.competitiveUnt && unt > 0)
      lines.push(t("aiFit.gap.unt", { unt, need: exp.competitiveUnt }));
    missingDocs.forEach((label) => lines.push(t("aiFit.gap.docMissing", { label })));
    pendingDocs.forEach((label) => lines.push(t("aiFit.gap.docPending", { label })));
    if (!programsInterestMatch && student.preferences.interests.length > 0)
      lines.push(t("aiFit.gap.interests"));
    if (lines.length === 0) lines.push(t("aiFit.gap.none"));
    return lines;
  }, [t, gpa, gpaCompetitive, englishOk, sat, unt, exp, missingDocs, pendingDocs, programsInterestMatch, student.preferences.interests.length]);

  const nextSteps = useMemo(() => {
    const steps: string[] = [];
    if (missingDocs.length || pendingDocs.length)
      steps.push(t("aiFit.step.docs", { count: missingDocs.length + pendingDocs.length }));
    if (!englishOk) steps.push(t("aiFit.step.english"));
    if (!gpaCompetitive) steps.push(t("aiFit.step.grades"));
    steps.push(t("aiFit.step.shortlist"));
    steps.push(t("aiFit.step.deadline"));
    steps.push(t("aiFit.step.overview"));
    return steps;
  }, [t, missingDocs.length, pendingDocs.length, englishOk, gpaCompetitive]);

  const tierBadgeClass: Record<typeof tier, string> = {
    strong: "bg-emerald-100 text-emerald-950 ring-emerald-300",
    qualified: "bg-sky-100 text-sky-950 ring-sky-300",
    partial: "bg-amber-100 text-amber-950 ring-amber-300",
    low: "bg-rose-100 text-rose-950 ring-rose-300",
  };

  return (
    <section id="ai-fit-card" className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{t("aiFit.kicker")}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {t("aiFit.title", { name: universityName })}
            </h2>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${tierBadgeClass[tier]}`}
            >
              {t(`aiFit.tier.${tier}`)}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {t("aiFit.intro", {
              name: universityName,
              cgpa: exp.competitiveGpa.toFixed(1),
              sgpa: exp.strongGpa.toFixed(1),
              scale: exp.gpaScaleMax.toFixed(1),
              unt: exp.competitiveUnt,
              ielts: exp.minIelts,
              note: exp.modelNote,
            })}
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{t("aiFit.blockStrengths")}</p>
              <ul className="mt-2 space-y-2 text-sm text-emerald-950">
                {strengths.map((line, idx) => (
                  <li key={`str-${idx}`} className="flex gap-2">
                    <span className="mt-0.5 font-bold text-emerald-600" aria-hidden>
                      ✓
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">{t("aiFit.blockGaps")}</p>
              <ul className="mt-2 space-y-2 text-sm text-amber-950">
                {gaps.map((line, idx) => (
                  <li key={`gap-${idx}`} className="flex gap-2">
                    <span className="mt-0.5 font-bold text-amber-600" aria-hidden>
                      !
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">{t("aiFit.blockSteps")}</p>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-800">
              {nextSteps.map((s, idx) => (
                <li key={`step-${idx}`}>{s}</li>
              ))}
            </ol>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-slate-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
              <span>
                <span className="font-medium">
                  GPA {gpa.toFixed(1)}/{exp.gpaScaleMax.toFixed(1)}
                </span>
                {gpaBoost ? (
                  <span className="text-emerald-700">{t("aiFit.gpaStrong")}</span>
                ) : gpaCompetitive ? (
                  <span className="text-slate-600">{t("aiFit.gpaCompetitive")}</span>
                ) : (
                  <span className="text-amber-800">{t("aiFit.gpaLow")}</span>
                )}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden />
              <span>
                <span className="font-medium">IELTS {ielts.toFixed(1)}</span>
                {englishOk ? (
                  <span className="text-emerald-700">{t("aiFit.ieltsOk")}</span>
                ) : (
                  <span className="text-amber-800">{t("aiFit.ieltsLow", { min: exp.minIelts })}</span>
                )}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
              <span>
                <span className="font-medium">
                  {sat > 0 ? t("aiFit.satLine", { value: sat }) : t("aiFit.satNotSet")}
                </span>
                <span className="text-slate-500">
                  {sat > 0 ? t("aiFit.satExplained") : t("aiFit.satExplainedNone")}
                </span>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" aria-hidden />
              <span>
                <span className="font-medium">{t("aiFit.untLine", { score: unt })}</span>
                <span className="text-slate-500">{t("aiFit.untExplained")}</span>
              </span>
            </li>
            {student.awards.length > 0 && (
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                <span>
                  <span className="font-medium">{t("aiFit.awards")}</span>: {student.awards.join(", ")}
                </span>
              </li>
            )}
          </ul>

          <div id="ai-exec-summary" className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 ring-1 ring-indigo-100/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-indigo-900">{t("aiFit.execTitle")}</h3>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-indigo-600">
                  {t("aiFit.execSub")}
                </p>
              </div>
              <button
                type="button"
                onClick={onRequestExecutiveSummary}
                disabled={executiveLoading}
                className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {executiveSummary ? t("aiFit.refreshOverview") : t("aiFit.getOverview")}
              </button>
            </div>
            {!isAiConfigured() && (
              <p className="mt-3 text-xs text-slate-600">
                {t("aiFit.overviewNoKey")}
              </p>
            )}
            {executiveLoading ? (
              <div className="mt-3">
                <TextSkeleton lines={5} />
              </div>
            ) : executiveError ? (
              <p className="mt-3 text-sm text-red-700">{executiveError}</p>
            ) : executiveSummary ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-800">{executiveSummary}</p>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                {t("aiFit.overviewEmpty")}
              </p>
            )}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-6 ring-1 ring-indigo-100 lg:max-w-xs">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-indigo-700">
            {t("aiFit.overall")}
          </p>
          <p className="mt-2 text-center text-xs font-semibold text-indigo-800">{t(`aiFit.tier.${tier}`)}</p>
          <p className="mt-2 text-center text-5xl font-bold tabular-nums text-slate-900">{averageFitPercent}%</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500"
              style={{ width: `${Math.min(100, Math.max(0, averageFitPercent))}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
