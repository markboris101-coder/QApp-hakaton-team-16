import React from "react";
import { useTranslation } from "react-i18next";

const LOCALES = ["kk", "ru", "en"] as const;

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const active = (i18n.resolvedLanguage ?? i18n.language).slice(0, 2);

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm"
      role="group"
      aria-label={t("lang.label")}
    >
      {LOCALES.map((lng) => {
        const isOn = active === lng || (lng === "kk" && active === "kz");
        return (
          <button
            key={lng}
            type="button"
            onClick={() => void i18n.changeLanguage(lng)}
            className={`rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              isOn ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
            aria-pressed={isOn}
            title={t(`lang.${lng}`)}
          >
            {lng}
          </button>
        );
      })}
    </div>
  );
}
