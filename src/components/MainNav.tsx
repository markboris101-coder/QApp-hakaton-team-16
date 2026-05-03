import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProfile } from "../context/ProfileContext";
import { useAssistantIntake } from "../context/AssistantIntakeContext";
import { getUniversityDisplayName } from "../lib/universityLabels";
import { resolveUniversityExternalWebsite } from "../lib/universityWebsite";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavGateLink } from "./NavGateLink";

export function MainNav() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { universityData, student } = useProfile();
  const { hydrated, intakeDone } = useAssistantIntake();
  const [mobileOpen, setMobileOpen] = useState(false);

  const gateApply = !(hydrated && intakeDone);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  const scrollToIntake = () => {
    document.getElementById("assistant-intake-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isLanding = location.pathname === "/";
  const isDashboard = location.pathname === "/dashboard";
  const uniName = getUniversityDisplayName(universityData, i18n.language);
  const externalApplyUrl = resolveUniversityExternalWebsite(universityData);
  const applyHref = externalApplyUrl ?? "/dashboard#admission-checklist";
  const applyIsExternal = Boolean(externalApplyUrl);

  const platformLinkClass =
    "rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 sm:px-3 sm:text-sm sm:font-medium";

  const prototypeLinkClass = (active: boolean) =>
    `rounded-lg px-2.5 py-2 text-xs font-medium sm:px-3 sm:text-sm ${
      active ? "bg-indigo-50 text-indigo-800" : "text-slate-700 hover:bg-slate-100"
    }`;

  const mobileRowClass = "rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[min(100%,1400px)] flex-wrap items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-semibold text-slate-900">
          <span className="rounded-lg bg-indigo-600 px-2 py-1 text-xs text-white">QApp</span>
          <span className="hidden min-[400px]:inline">{t("nav.universityHub")}</span>
        </Link>

        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-800 hover:bg-slate-50 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="main-nav-mobile-menu"
          aria-label={mobileOpen ? t("nav.menuClose") : t("nav.menuOpen")}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span className="sr-only">{mobileOpen ? t("nav.menuClose") : t("nav.menuOpen")}</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="text-slate-700">
            {mobileOpen ? (
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>

        <nav className="hidden flex-wrap items-center gap-1 md:flex lg:gap-2" aria-label="QApp platform">
          <Link to="/#catalog-search" className={platformLinkClass}>
            {t("nav.platformRanking")}
          </Link>
          <NavGateLink to="/dashboard#ai-fit-card" className={platformLinkClass}>
            {t("nav.platformAbout")}
          </NavGateLink>
          <NavGateLink to="/dashboard#admission-checklist" className={platformLinkClass}>
            {t("nav.platformApply")}
          </NavGateLink>
          <NavGateLink to="/blog" className={platformLinkClass}>
            {t("nav.platformBlog")}
          </NavGateLink>
        </nav>

        <nav className="hidden flex-wrap items-center gap-1 md:flex" aria-label="Prototype">
          <Link to="/" className={prototypeLinkClass(isLanding)}>
            {t("nav.home")}
          </Link>
          <NavGateLink to="/dashboard" className={prototypeLinkClass(isDashboard)}>
            {t("nav.dashboard")}
          </NavGateLink>
          <NavGateLink to="/profile" className={prototypeLinkClass(location.pathname === "/profile")}>
            {t("nav.profile")}
          </NavGateLink>
          {isDashboard && (
            <>
              <NavGateLink to="/dashboard#program-grid" className={prototypeLinkClass(false)}>
                {t("nav.programs")}
              </NavGateLink>
              <NavGateLink to="/dashboard#admission-checklist" className={prototypeLinkClass(false)}>
                {t("nav.documents")}
              </NavGateLink>
            </>
          )}
        </nav>

        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 md:ml-auto md:w-auto md:flex-nowrap">
          <LanguageSwitcher />
          {!isLanding && (
            <div className="hidden max-w-[180px] truncate text-right text-xs text-slate-600 xl:block">
              <span className="font-medium text-slate-800">{uniName}</span>
              <span className="text-slate-500"> · {universityData.city.split(",")[0].trim()}</span>
            </div>
          )}
          <NavGateLink
            to="/profile"
            ariaLabel={t("nav.avatarAria")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-xs font-bold text-indigo-900 ring-2 ring-white hover:from-indigo-200 hover:to-violet-200"
          >
            <span aria-hidden>★</span>
          </NavGateLink>
          {gateApply ? (
            <button
              type="button"
              onClick={scrollToIntake}
              className="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-center text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 sm:font-semibold"
            >
              {t("nav.applyTo", { name: uniName.split(" ")[0] ?? uniName })}
            </button>
          ) : applyIsExternal ? (
            <a
              href={applyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-center text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 sm:font-semibold"
            >
              {t("nav.applyTo", { name: uniName.split(" ")[0] ?? uniName })}
            </a>
          ) : (
            <Link
              to={applyHref}
              className="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-center text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 sm:font-semibold"
            >
              {t("nav.applyTo", { name: uniName.split(" ")[0] ?? uniName })}
            </Link>
          )}
          <Link
            to="/"
            className="hidden shrink-0 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800 shadow-sm transition hover:bg-indigo-100 sm:inline-flex"
          >
            {isLanding ? t("nav.catalog") : t("nav.changeUniversity")}
          </Link>
        </div>

        <div className="hidden w-full justify-end text-right text-xs text-slate-500 md:flex xl:hidden">
          <span className="font-medium text-slate-800">GPA {student.academic.gpa.toFixed(1)}</span>
          <span className="mx-1">·</span>
          <span>IELTS {student.academic.ielts.toFixed(1)}</span>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="main-nav-mobile-menu"
          className="border-t border-slate-100 bg-white px-4 py-4 md:hidden"
          role="region"
          aria-label={t("nav.mobileMenuLabel")}
        >
          <div className="flex flex-col gap-1">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">QApp</p>
            <Link to="/#catalog-search" className={mobileRowClass}>
              {t("nav.platformRanking")}
            </Link>
            <NavGateLink to="/dashboard#ai-fit-card" className={mobileRowClass}>
              {t("nav.platformAbout")}
            </NavGateLink>
            <NavGateLink to="/dashboard#admission-checklist" className={mobileRowClass}>
              {t("nav.platformApply")}
            </NavGateLink>
            <NavGateLink to="/blog" className={mobileRowClass}>
              {t("nav.platformBlog")}
            </NavGateLink>
            <hr className="my-2 border-slate-100" />
            <Link to="/" className={mobileRowClass}>
              {t("nav.home")}
            </Link>
            <NavGateLink to="/dashboard" className={mobileRowClass}>
              {t("nav.dashboard")}
            </NavGateLink>
            <NavGateLink to="/profile" className={mobileRowClass}>
              {t("nav.profile")}
            </NavGateLink>
            <NavGateLink to="/dashboard#program-grid" className={mobileRowClass}>
              {t("nav.programs")}
            </NavGateLink>
            <NavGateLink to="/dashboard#admission-checklist" className={mobileRowClass}>
              {t("nav.checklist")}
            </NavGateLink>
          </div>
        </div>
      )}
    </header>
  );
}
