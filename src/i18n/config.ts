import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import ru from "../locales/ru.json";
import kk from "../locales/kk.json";

const STORAGE_KEY = "qapp-locale";

function detectLanguage(): string {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === "kk" || s === "ru" || s === "en") return s;
  } catch {
    /* private mode */
  }
  if (typeof navigator === "undefined") return "ru";
  const n = navigator.language.toLowerCase();
  if (n.startsWith("kk") || n.startsWith("kz")) return "kk";
  if (n.startsWith("ru")) return "ru";
  if (n.startsWith("en")) return "en";
  return "ru";
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    kk: { translation: kk },
  },
  lng: detectLanguage(),
  fallbackLng: "ru",
  supportedLngs: ["kk", "ru", "en"],
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng;
  }
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
}

export default i18n;
