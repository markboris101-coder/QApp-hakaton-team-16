import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DOCUMENT_ENTRIES } from "./documentLabels";
import { getDemoAnalytics, resetDemoAnalytics } from "../lib/demoAnalytics";

export function DemoAnalyticsPanel() {
  const { t } = useTranslation();
  const [version, setVersion] = useState(0);
  const snap = useMemo(() => getDemoAnalytics(), [version]);

  const docTotal = DOCUMENT_ENTRIES.length;

  const refresh = () => setVersion((v) => v + 1);

  const onReset = () => {
    resetDemoAnalytics();
    refresh();
  };

  return (
    <section
      className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50/90 p-5 ring-1 ring-slate-100"
      aria-labelledby="demo-analytics-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="demo-analytics-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            {t("demoAnalytics.title")}
          </h2>
          <p className="mt-1 max-w-xl text-xs text-slate-600">{t("demoAnalytics.hint")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            {t("demoAnalytics.refresh")}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-50"
          >
            {t("demoAnalytics.reset")}
          </button>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200/80">
          <dt className="text-xs font-medium text-slate-500">{t("demoAnalytics.landing")}</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-slate-900">{snap.landingVisits}</dd>
        </div>
        <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200/80">
          <dt className="text-xs font-medium text-slate-500">{t("demoAnalytics.intake")}</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-slate-900">{snap.intakeCompleted}</dd>
        </div>
        <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200/80">
          <dt className="text-xs font-medium text-slate-500">{t("demoAnalytics.dashboard")}</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-slate-900">{snap.dashboardVisits}</dd>
        </div>
        <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200/80">
          <dt className="text-xs font-medium text-slate-500">{t("demoAnalytics.profile")}</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-slate-900">{snap.profileVisits}</dd>
        </div>
        <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200/80">
          <dt className="text-xs font-medium text-slate-500">{t("demoAnalytics.blog")}</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-slate-900">{snap.blogVisits}</dd>
        </div>
        <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-emerald-100">
          <dt className="text-xs font-medium text-slate-500">{t("demoAnalytics.checklistPeak")}</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-emerald-900">
            {snap.checklistReadyPeak}/{docTotal}
          </dd>
        </div>
        <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-indigo-100 sm:col-span-2 lg:col-span-1">
          <dt className="text-xs font-medium text-slate-500">{t("demoAnalytics.shortlistPeak")}</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-indigo-900">{snap.shortlistPeak}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[11px] text-slate-500">{t("demoAnalytics.updated", { iso: snap.lastEventAt })}</p>
    </section>
  );
}
