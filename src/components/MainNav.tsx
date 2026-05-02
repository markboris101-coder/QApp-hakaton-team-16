import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProfile } from "../context/ProfileContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MainNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const { universityData, student } = useProfile();

  const isLanding = location.pathname === "/";
  const isDashboard = location.pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[min(100%,1400px)] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="rounded-lg bg-indigo-600 px-2 py-1 text-xs text-white">QApp</span>
          <span className="hidden sm:inline">{t("nav.universityHub")}</span>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center gap-1 sm:gap-2" aria-label="Main">
          <Link
            to="/"
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              isLanding ? "bg-indigo-50 text-indigo-800" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {t("nav.home")}
          </Link>
          <Link
            to="/dashboard"
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              isDashboard ? "bg-indigo-50 text-indigo-800" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {t("nav.dashboard")}
          </Link>
          {isDashboard && (
            <>
              <a
                href="/dashboard#ai-fit-card"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {t("nav.aiFit")}
              </a>
              <a
                href="/dashboard#program-grid"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {t("nav.programs")}
              </a>
              <a
                href="/dashboard#admission-checklist"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {t("nav.documents")}
              </a>
            </>
          )}
          {!isDashboard && (
            <>
              <Link
                to="/dashboard#program-grid"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {t("nav.programs")}
              </Link>
              <Link
                to="/dashboard#admission-checklist"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {t("nav.checklist")}
              </Link>
            </>
          )}
          <Link
            to="/profile"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {t("nav.profile")}
          </Link>
        </nav>

        <div className="flex min-w-0 flex-1 basis-full items-center justify-end gap-2 sm:basis-auto sm:flex-none">
          <LanguageSwitcher />
          {!isLanding && (
            <div className="hidden min-w-0 max-w-[200px] truncate text-right text-xs text-slate-600 sm:block">
              <span className="font-medium text-slate-800">{universityData.name}</span>
              <span className="text-slate-500"> · {universityData.city.split(",")[0].trim()}</span>
            </div>
          )}
          <Link
            to="/"
            className="shrink-0 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800 shadow-sm transition hover:bg-indigo-100"
          >
            {isLanding ? t("nav.catalog") : t("nav.changeUniversity")}
          </Link>
        </div>

        <div className="hidden text-right text-xs text-slate-500 md:block">
          <span className="font-medium text-slate-800">GPA {student.academic.gpa.toFixed(1)}</span>
          <span className="mx-1">·</span>
          <span>IELTS {student.academic.ielts.toFixed(1)}</span>
        </div>
      </div>
    </header>
  );
}
