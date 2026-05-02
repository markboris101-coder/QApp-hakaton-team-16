import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { StudentDocuments, StudentProfile } from "../mockData";
import { DOCUMENT_ENTRIES } from "./documentLabels";

type Props = {
  applicationDeadlineIso: string;
  documents: StudentDocuments;
  shortlistCount: number;
  student: StudentProfile;
};

function daysUntilDeadline(iso: string): number {
  const end = new Date(iso + (iso.includes("T") ? "" : "T23:59:59"));
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/** Грубая доля пройденного «окна приёма» (120 дней до дедлайна = старт демо-шкалы). */
function admissionWindowPercent(deadlineIso: string): number {
  try {
    const end = new Date(deadlineIso.includes("T") ? deadlineIso : `${deadlineIso}T23:59:59`);
    if (Number.isNaN(end.getTime())) return 40;
    const start = new Date(end);
    start.setDate(start.getDate() - 120);
    const now = Date.now();
    const t = (now - start.getTime()) / (end.getTime() - start.getTime());
    return Math.max(0, Math.min(100, Math.round(t * 100)));
  } catch {
    return 40;
  }
}

type RailId = "today" | "profile" | "docs" | "programs" | "submit" | "review";

export function DeadlinesTimeline({
  applicationDeadlineIso,
  documents,
  shortlistCount,
  student,
}: Props) {
  const { t, i18n } = useTranslation();

  const locale = i18n.language.startsWith("kk") ? "kk-KZ" : i18n.language.startsWith("ru") ? "ru-RU" : "en-US";

  const formatLongDate = (iso: string) => {
    const d = new Date(iso + (iso.includes("T") ? "" : "T12:00:00"));
    return d.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const formatShortToday = () =>
    new Date().toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });

  const daysLeft = useMemo(() => daysUntilDeadline(applicationDeadlineIso), [applicationDeadlineIso]);
  const medicalActionNeeded = documents.medicalCertificate !== "READY";

  const readyCount = useMemo(
    () => DOCUMENT_ENTRIES.filter((e) => documents[e.key] === "READY").length,
    [documents]
  );
  const totalDocs = DOCUMENT_ENTRIES.length;
  const allDocsReady = readyCount === totalDocs;
  const profileComplete =
    Boolean(student.preferences.city?.trim()) && student.preferences.interests.length > 0;

  const windowPct = useMemo(() => admissionWindowPercent(applicationDeadlineIso), [applicationDeadlineIso]);

  const currentRail = useMemo((): RailId => {
    if (!profileComplete) return "profile";
    if (!allDocsReady) return "docs";
    if (shortlistCount === 0) return "programs";
    if (daysLeft >= 0) return "submit";
    return "review";
  }, [profileComplete, allDocsReady, shortlistCount, daysLeft]);

  const rail = useMemo(
    () =>
      [
        { id: "today" as const, label: t("deadlines.railToday") },
        { id: "profile" as const, label: t("deadlines.railProfile") },
        { id: "docs" as const, label: t("deadlines.railDocs") },
        { id: "programs" as const, label: t("deadlines.railPrograms") },
        { id: "submit" as const, label: t("deadlines.railSubmit") },
        { id: "review" as const, label: t("deadlines.railOutcome") },
      ] as const,
    [t, i18n.language]
  );

  const stateFor = (id: RailId): "done" | "current" | "upcoming" => {
    const order: RailId[] = ["today", "profile", "docs", "programs", "submit", "review"];
    const curIdx = order.indexOf(currentRail);
    const idx = order.indexOf(id);
    if (id === "today") return "done";
    if (idx < curIdx) return "done";
    if (idx === curIdx) return "current";
    return "upcoming";
  };

  const urgencyBand =
    daysLeft < 0 ? "slate" : daysLeft <= 7 ? "critical" : daysLeft <= 30 ? "soon" : "ok";

  const heroGradient =
    urgencyBand === "critical"
      ? "from-rose-600 via-orange-500 to-amber-500"
      : urgencyBand === "soon"
        ? "from-amber-500 via-yellow-400 to-lime-400"
        : urgencyBand === "ok"
          ? "from-emerald-600 via-teal-500 to-cyan-500"
          : "from-slate-600 to-slate-800";

  const daysDisplay = daysLeft < 0 ? "—" : daysLeft;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-lg ring-1 ring-slate-100">
      <div className={`relative bg-gradient-to-br px-6 py-8 text-white sm:px-10 sm:py-10 ${heroGradient}`}>
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">{t("deadlines.kicker")}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t("deadlines.title")}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/90">{t("deadlines.subtitle")}</p>
          </div>
          <div className="flex shrink-0 flex-col items-center rounded-2xl bg-white/10 px-8 py-6 text-center shadow-inner ring-1 ring-white/30 backdrop-blur-sm">
            <p className="text-6xl font-black tabular-nums leading-none sm:text-7xl">{daysDisplay}</p>
            <p className="mt-2 text-sm font-medium text-white/95">{t("deadlines.heroCaption")}</p>
            <p className="mt-1 text-xs text-white/75">{formatLongDate(applicationDeadlineIso)}</p>
            {daysLeft === 0 ? (
              <p className="mt-3 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                {t("deadlines.heroToday")}
              </p>
            ) : null}
            {daysLeft < 0 ? (
              <p className="mt-3 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                {t("deadlines.heroOverdue")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative mt-8 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-white/90">
            <span>{t("deadlines.windowLabel")}</span>
            <span className="tabular-nums">{windowPct}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/20">
            <div
              className="h-full rounded-full bg-white/95 shadow-md transition-all duration-500"
              style={{ width: `${windowPct}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] leading-snug text-white/75">{t("deadlines.windowHint")}</p>
        </div>
      </div>

      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-6 sm:px-8">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("deadlines.railToday")} → {t("deadlines.railProfile")} → {t("deadlines.railDocs")} →{" "}
          {t("deadlines.railPrograms")} → {t("deadlines.railSubmit")} → {t("deadlines.railOutcome")}
        </p>
        <div className="flex gap-1 overflow-x-auto pb-2 pt-1 sm:justify-between sm:gap-0">
          {rail.map((step, i) => {
            const st = stateFor(step.id);
            const isSubmitHot = step.id === "submit" && daysLeft > 0 && daysLeft <= 7 && st === "current";
            return (
              <div
                key={step.id}
                className="flex min-w-[72px] flex-1 flex-col items-center gap-2 sm:min-w-0"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-md ring-4 ring-white transition ${
                    st === "done"
                      ? "bg-emerald-500 text-white"
                      : st === "current"
                        ? isSubmitHot
                          ? "animate-pulse bg-rose-600 text-white ring-rose-200"
                          : "bg-indigo-600 text-white ring-indigo-200"
                        : "border-2 border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {st === "done" ? "✓" : i + 1}
                </div>
                <p className="max-w-[84px] text-center text-[10px] font-semibold uppercase leading-tight text-slate-600 sm:text-[11px]">
                  {step.label}
                </p>
                <span
                  className={`hidden text-[10px] font-medium sm:block ${
                    st === "current" ? "text-indigo-700" : "text-slate-400"
                  }`}
                >
                  {st === "done"
                    ? t("deadlines.railStatusDone")
                    : st === "current"
                      ? t("deadlines.railStatusNow")
                      : t("deadlines.railStatusNext")}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-xs text-slate-600">
          {t("deadlines.docsCounter", { ready: readyCount, total: totalDocs })}
        </p>
      </div>

      <div className="space-y-6 px-6 py-8 sm:px-10">
        {medicalActionNeeded && (
          <div
            className="rounded-2xl border border-red-300/90 bg-gradient-to-r from-red-50 to-orange-50 px-5 py-4 text-sm leading-relaxed text-red-950 shadow-sm ring-1 ring-red-200/70"
            role="alert"
          >
            <span className="font-semibold">{t("deadlines.railStatusNow")}: </span>
            {t("deadlines.alertMedical")}
          </div>
        )}

        <div className="relative pl-2">
          <div
            className="absolute left-[19px] top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-indigo-300 via-violet-300 to-slate-200"
            aria-hidden
          />

          <ol className="space-y-8">
            <li className="relative flex gap-5">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-lg ring-4 ring-white">
                1
              </div>
              <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/90 px-5 py-4 pt-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{t("deadlines.milestoneToday")}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {t("deadlines.milestoneTodaySub", { date: formatShortToday() })}
                </p>
              </div>
            </li>

            <li className="relative flex gap-5">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-indigo-200 bg-white text-sm font-bold text-indigo-800 shadow-md ring-4 ring-white">
                2
              </div>
              <div className="min-w-0 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-sm font-semibold text-slate-900">{t("deadlines.milestoneUpload")}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{t("deadlines.milestoneUploadSub")}</p>
              </div>
            </li>

            <li className="relative flex gap-5">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-sm font-bold text-white shadow-lg ring-4 ring-white">
                3
              </div>
              <div className="min-w-0 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white px-5 py-4 shadow-md ring-1 ring-indigo-100">
                <p className="text-sm font-semibold text-slate-900">{t("deadlines.milestoneFinal")}</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{formatLongDate(applicationDeadlineIso)}</p>
                <p className="mt-3 text-sm text-slate-600">
                  {daysLeft > 0 ? (
                    <span className="font-medium text-indigo-900">
                      {t("deadlines.milestoneDaysLeft", { count: daysLeft })}
                    </span>
                  ) : daysLeft === 0 ? (
                    <span className="font-medium text-amber-900">{t("deadlines.milestoneTodayAction")}</span>
                  ) : (
                    <span className="font-medium text-slate-700">{t("deadlines.milestonePast")}</span>
                  )}
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
