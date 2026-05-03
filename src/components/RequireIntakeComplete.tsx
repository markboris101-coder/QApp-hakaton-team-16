import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAssistantIntake } from "../context/AssistantIntakeContext";

export function RequireIntakeComplete() {
  const { t } = useTranslation();
  const location = useLocation();
  const { hydrated, intakeDone } = useAssistantIntake();

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-slate-50 px-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"
          aria-hidden
        />
        <p className="text-sm text-slate-600">{t("intake.guardLoading")}</p>
      </div>
    );
  }

  if (!intakeDone) {
    return <Navigate to="/" replace state={{ blockedPath: location.pathname }} />;
  }

  return <Outlet />;
}
