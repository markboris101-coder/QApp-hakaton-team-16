import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useProfile } from "../context/ProfileContext";
import { ProfileEditorForm } from "../components/ProfileEditorForm";
import { DemoAnalyticsPanel } from "../components/DemoAnalyticsPanel";
import { bumpProfileVisit } from "../lib/demoAnalytics";
import { getUniversityDisplayName } from "../lib/universityLabels";

const SHELL = "mx-auto w-full max-w-[min(100%,1400px)] px-4 sm:px-6";

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    student,
    setStudent,
    universityData,
    universities,
    favoriteUniversityIds,
    toggleFavoriteUniversity,
    setSelectedUniversityId,
  } = useProfile();

  useEffect(() => {
    bumpProfileVisit();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900"
    >
      <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
        <div className={`${SHELL} flex flex-wrap items-center justify-between gap-3 py-4`}>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              {t("profile.backHome")}
            </Link>
            <span className="text-sm text-slate-500">
              {getUniversityDisplayName(universityData, i18n.language)}
            </span>
          </div>
          <p className="text-xs text-slate-500">{t("profile.autosave")}</p>
        </div>
      </header>

      <div className={`${SHELL} py-10`}>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t("profile.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          {t("profile.subtitle")}
        </p>

        {favoriteUniversityIds.length > 0 && (
          <section className="mt-10 rounded-2xl border border-amber-200/90 bg-amber-50/50 p-5 ring-1 ring-amber-100/80">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900">{t("profile.favoritesHeading")}</h2>
            <p className="mt-1 text-sm text-amber-950/80">
              {t("profile.favoritesHint")}
            </p>
            <ul className="mt-4 space-y-2">
              {favoriteUniversityIds.map((id) => {
                const u = universities.find((x) => x.id === id);
                if (!u) return null;
                return (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200/80 bg-white px-3 py-2.5"
                  >
                    <span className="text-sm font-medium text-slate-900">
                      {getUniversityDisplayName(u, i18n.language)}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUniversityId(u.id);
                          navigate("/dashboard");
                        }}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        {t("profile.dashboardBtn")}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavoriteUniversity(u.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {t("profile.removeBtn")}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Link to="/" className="mt-3 inline-block text-sm font-medium text-indigo-700 hover:underline">
              {t("profile.catalogLink")}
            </Link>
          </section>
        )}

        <div className="mt-10">
          <ProfileEditorForm student={student} onStudentChange={setStudent} />
        </div>

        <DemoAnalyticsPanel />
      </div>
    </motion.div>
  );
}
