import { useTranslation } from "react-i18next";
import type { StudentProfile, UniversityAdmissionExpectations } from "../mockData";
import { TextSkeleton } from "./TextSkeleton";
import { isAiConfigured } from "../services/aiProvider";

type Props = {
  universityName: string;
  averageFitPercent: number;
  student: StudentProfile;
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
  executiveSummary,
  executiveLoading,
  executiveError,
  onRequestExecutiveSummary,
  admissionExpectations: exp,
}: Props) {
  const { t } = useTranslation();
  const gpa = student.academic.gpa;
  const ielts = student.academic.ielts;
  const sat = student.academic.sat;
  const unt = student.academic.untScore;
  const gpaBoost = gpa >= exp.strongGpa;
  const gpaCompetitive = gpa >= exp.competitiveGpa;
  const englishOk = ielts >= exp.minIelts;

  return (
    <section id="ai-fit-card" className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{t("aiFit.kicker")}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {t("aiFit.title", { name: universityName })}
          </h2>
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
          <ul className="mt-5 space-y-2 text-sm text-slate-700">
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
