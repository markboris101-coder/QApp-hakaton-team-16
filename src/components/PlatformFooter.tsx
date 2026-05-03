import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavGateLink } from "./NavGateLink";

export function PlatformFooter() {
  const { t } = useTranslation();
  const exploreLink = "text-slate-700 hover:text-indigo-700";

  return (
    <footer className="border-t border-slate-200/90 bg-slate-50">
      <div className="mx-auto flex w-full max-w-[min(100%,1400px)] flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-bold text-white">QApp</span>
            <span className="text-sm font-semibold text-slate-900">Smart University Profile</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">{t("footer.tagline")}</p>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("footer.explore")}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/#catalog-search" className={exploreLink}>
                  {t("nav.platformRanking")}
                </Link>
              </li>
              <li>
                <NavGateLink to="/dashboard#ai-fit-card" className={exploreLink}>
                  {t("nav.platformAbout")}
                </NavGateLink>
              </li>
              <li>
                <NavGateLink to="/dashboard#admission-checklist" className={exploreLink}>
                  {t("nav.platformApply")}
                </NavGateLink>
              </li>
              <li>
                <NavGateLink to="/blog" className={exploreLink}>
                  {t("nav.platformBlog")}
                </NavGateLink>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("footer.account")}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <NavGateLink to="/dashboard#program-grid" className={exploreLink}>
                  {t("footer.applications")}
                </NavGateLink>
              </li>
              <li>
                <NavGateLink to="/profile" className={exploreLink}>
                  {t("footer.saved")}
                </NavGateLink>
              </li>
              <li>
                <NavGateLink to="/profile" className={exploreLink}>
                  {t("footer.settings")}
                </NavGateLink>
              </li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("footer.legal")}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="#" className={exploreLink}>
                  {t("footer.privacy")}
                </a>
              </li>
              <li>
                <a href="#" className={exploreLink}>
                  {t("footer.terms")}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200/80 bg-white/80">
        <div className="mx-auto flex max-w-[min(100%,1400px)] flex-col gap-1 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{t("footer.contactLine")}</p>
          <p className="text-slate-400">© {new Date().getFullYear()} QApp · demo prototype</p>
        </div>
      </div>
    </footer>
  );
}
