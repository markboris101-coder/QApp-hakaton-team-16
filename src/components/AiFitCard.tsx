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
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">AI fit</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            How you match {universityName}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Скор привязан к ориентирам вуза «{universityName}»: конкурентный GPA от ~{exp.competitiveGpa.toFixed(1)},
            сильный от ~{exp.strongGpa.toFixed(1)}/{exp.gpaScaleMax.toFixed(1)}, SAT от ~{exp.competitiveSat}, UNT от ~
            {exp.competitiveUnt}, IELTS ≥ {exp.minIelts}. Итог ограничен реалистичным потолком по GPA — высокий SAT не
            «лечит» слабый средний балл. {exp.modelNote}
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
              <span>
                <span className="font-medium">
                  GPA {gpa.toFixed(1)}/{exp.gpaScaleMax.toFixed(1)}
                </span>
                {gpaBoost ? (
                  <span className="text-emerald-700"> — сильный портфель для этого вуза</span>
                ) : gpaCompetitive ? (
                  <span className="text-slate-600"> — конкурентный диапазон</span>
                ) : (
                  <span className="text-amber-800"> — ниже ориентира (штраф к Fit)</span>
                )}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden />
              <span>
                <span className="font-medium">IELTS {ielts.toFixed(1)}</span>
                {englishOk ? (
                  <span className="text-emerald-700"> — порог выполнен</span>
                ) : (
                  <span className="text-amber-800">
                    {" "}
                    — ниже {exp.minIelts} (штраф к Fit)
                  </span>
                )}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
              <span>
                <span className="font-medium">SAT {sat}</span>
                <span className="text-slate-500"> — диапазоны влияют на итоговый Fit.</span>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" aria-hidden />
              <span>
                <span className="font-medium">UNT / ЕНТ {unt}/140</span>
                <span className="text-slate-500"> — национальный экзамен.</span>
              </span>
            </li>
            {student.awards.length > 0 && (
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                <span>
                  <span className="font-medium">Награды</span>: {student.awards.join(", ")}
                </span>
              </li>
            )}
          </ul>

          <div id="ai-exec-summary" className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 ring-1 ring-indigo-100/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-indigo-900">AI Executive Summary</h3>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-indigo-600">
                  Qwen 2.5 · поступление
                </p>
              </div>
              <button
                type="button"
                onClick={onRequestExecutiveSummary}
                disabled={executiveLoading}
                className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {executiveSummary ? "Обновить обзор" : "Получить обзор Qwen"}
              </button>
            </div>
            {!isAiConfigured() && (
              <p className="mt-3 text-xs text-slate-600">
                Добавьте <code className="rounded bg-white/80 px-1">VITE_API_KEY</code> в окружение — иначе вместо ответа
                Qwen покажется подсказка.
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
                Обзор не запрашивался. Нажмите «Получить обзор Qwen», чтобы сформировать текст без автозагрузки.
              </p>
            )}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-6 ring-1 ring-indigo-100 lg:max-w-xs">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Overall AI fit
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
