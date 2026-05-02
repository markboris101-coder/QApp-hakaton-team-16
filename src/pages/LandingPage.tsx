import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { AssistantIntakeForm } from "../components/AssistantIntakeForm";
import { AssistantRecommendationHero } from "../components/AssistantRecommendationHero";
import { UniversitySearchPanel } from "../components/UniversitySearchPanel";
import { useProfile } from "../context/ProfileContext";
import { useAssistantIntake } from "../hooks/useAssistantIntake";
import { getTopUniversityRecommendation } from "../lib/recommendUniversity";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function LandingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { student, universities, setSelectedUniversityId } = useProfile();
  const { hydrated, intakeDone, markIntakeComplete } = useAssistantIntake();

  const recommendation = useMemo(
    () => (intakeDone ? getTopUniversityRecommendation(student, universities) : null),
    [student, universities, intakeDone, i18n.language]
  );

  const scrollToCatalog = () => {
    document.getElementById("catalog-search")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-indigo-50/40"
    >
      <div className="mx-auto w-full max-w-[min(100%,960px)] px-4 py-12 sm:px-6 sm:py-16">
        <AnimatePresence mode="wait">
          {!hydrated ? (
            <motion.div
              key="loading"
              className="flex min-h-[50vh] flex-col items-center justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                className="h-12 w-12 rounded-full border-2 border-indigo-200 border-t-indigo-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-sm text-slate-500">{t("landing.loadingProfile")}</p>
            </motion.div>
          ) : !intakeDone ? (
            <motion.div
              key="intake"
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.4, ease: easeOut }}
            >
              <div className="mb-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                  {t("landing.badge")}
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {t("landing.intakeTitle")}
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
                  {t("landing.intakeSubtitle")}
                </p>
              </div>
              <AssistantIntakeForm onComplete={markIntakeComplete} />
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: easeOut }}
            >
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.4, ease: easeOut }}
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                  {t("landing.badge")}
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  {t("landing.mainTitle")}
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                  {t("landing.mainSubtitle")}
                </p>
              </motion.div>

              {recommendation && (
                <motion.div
                  className="mt-10"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.12, duration: 0.45, ease: easeOut }}
                >
                  <AssistantRecommendationHero
                    recommendation={recommendation}
                    onOpenRecommended={() => {
                      setSelectedUniversityId(recommendation.universityId);
                      navigate("/dashboard");
                    }}
                    onScrollToCatalog={scrollToCatalog}
                  />
                </motion.div>
              )}

              <motion.div
                id="catalog-search"
                className="mt-14 scroll-mt-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.42, ease: easeOut }}
              >
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{t("landing.catalogTitle")}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {t("landing.catalogSubtitle")}
                </p>
                <div className="mt-8">
                  <UniversitySearchPanel
                    universities={universities}
                    recommendedUniversityId={recommendation?.universityId}
                    onPickUniversity={(id) => {
                      setSelectedUniversityId(id);
                      navigate("/dashboard");
                    }}
                  />
                </div>
              </motion.div>

              <motion.p
                className="mt-10 text-center text-sm text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.35 }}
              >
                {t("landing.alreadyPrompt")}{" "}
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
                >
                  {t("landing.goDashboard")}
                </button>{" "}
                {t("landing.withSavedUniversity")}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
