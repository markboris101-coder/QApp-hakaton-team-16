import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { StudentDocuments } from "../mockData";
import { DOCUMENT_ENTRIES } from "./documentLabels";

type Props = {
  universityId: string;
  universityName: string;
  applicationDeadlineIso: string;
  documents: StudentDocuments;
  shortlistCount: number;
  favoriteUniversityCount: number;
};

function daysUntilDeadline(iso: string): number {
  const end = new Date(iso + (iso.includes("T") ? "" : "T23:59:59"));
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function dateLocaleFor(lang: string): string {
  if (lang.startsWith("kk")) return "kk-KZ";
  if (lang.startsWith("ru")) return "ru-RU";
  return "en-US";
}

function formatWeekdayDate(iso: string, locale: string): string {
  const d = new Date(iso + (iso.includes("T") ? "" : "T12:00:00"));
  return d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function ThisWeekPanel({
  universityId,
  universityName,
  applicationDeadlineIso,
  documents,
  shortlistCount,
  favoriteUniversityCount,
}: Props) {
  const { t, i18n } = useTranslation();
  const dateLocale = dateLocaleFor(i18n.language);

  const daysLeft = useMemo(() => daysUntilDeadline(applicationDeadlineIso), [applicationDeadlineIso]);

  const missingLabels = useMemo(() => {
    return DOCUMENT_ENTRIES.filter((e) => documents[e.key] !== "READY").map((e) =>
      t(`documentEntries.${e.key}`)
    );
  }, [documents, t]);

  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    const storageKey = `qapp-daily-deadline-nudge-${universityId}-${applicationDeadlineIso}`;
    const tick = () => {
      if (daysLeft < 0) return;
      const today = new Date().toDateString();
      if (localStorage.getItem(storageKey) === today) return;
      if (daysLeft > 21) return;
      try {
        new Notification(`QApp · ${universityName}`, {
          body:
            daysLeft === 0
              ? t("thisWeek.notifBodyToday")
              : t("thisWeek.notifBodySoon", { days: daysLeft, missing: missingLabels.length }),
          tag: `deadline-${universityId}`,
        });
        localStorage.setItem(storageKey, today);
      } catch {
        /* ignore */
      }
    };

    tick();
    const id = window.setInterval(tick, 45 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [
    universityId,
    universityName,
    applicationDeadlineIso,
    daysLeft,
    missingLabels.length,
    t,
  ]);

  const deadlineDateStr = formatWeekdayDate(applicationDeadlineIso, dateLocale);

  const tasks: string[] = useMemo(() => {
    const out: string[] = [];
    if (daysLeft < 0) {
      out.push(t("thisWeek.taskDeadlinePassed"));
    } else if (daysLeft <= 7) {
      out.push(t("thisWeek.taskDeadlineSoon", { days: daysLeft, uni: universityName }));
    } else {
      out.push(t("thisWeek.taskDeadlineComfort", { date: deadlineDateStr, days: daysLeft }));
    }
    if (missingLabels.length > 0) {
      const list = `${missingLabels.slice(0, 3).join(", ")}${missingLabels.length > 3 ? "…" : "."}`;
      out.push(t("thisWeek.taskMissingDocs", { list }));
    }
    if (shortlistCount === 0) {
      out.push(t("thisWeek.taskShortlist"));
    }
    if (favoriteUniversityCount === 0) {
      out.push(t("thisWeek.taskFavorites"));
    }
    if (out.length < 3) {
      out.push(t("thisWeek.taskFallback"));
    }
    return out;
  }, [
    daysLeft,
    deadlineDateStr,
    favoriteUniversityCount,
    missingLabels,
    shortlistCount,
    t,
    universityName,
  ]);

  const requestNotifications = async () => {
    if (typeof Notification === "undefined") {
      window.alert(t("thisWeek.notificationsNoSupport"));
      return;
    }
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p === "granted") {
      try {
        new Notification("QApp", {
          body: t("thisWeek.notificationsGrantedToast"),
        });
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <section className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 p-6 shadow-sm ring-1 ring-indigo-100/80 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{t("thisWeek.kicker")}</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-900">{t("thisWeek.title")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
        {t("thisWeek.subtitle")}{" "}
        <span className="font-medium text-slate-800">{deadlineDateStr}</span>
        {daysLeft >= 0 ? <> {t("thisWeek.daysParenthetical", { days: daysLeft })}</> : null}.
      </p>

      <ol className="mt-6 space-y-3">
        {tasks.map((task, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-sm"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {i + 1}
            </span>
            <span>{task}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-3 border-t border-indigo-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          <span className="font-medium text-slate-800">{t("thisWeek.notificationsTitle")}</span>
          {permission === "granted" ? (
            <p className="mt-1 text-xs text-emerald-800">{t("thisWeek.notificationsGranted")}</p>
          ) : permission === "denied" ? (
            <p className="mt-1 text-xs text-amber-900">{t("thisWeek.notificationsDenied")}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-600">{t("thisWeek.notificationsPrompt")}</p>
          )}
        </div>
        {permission !== "granted" && (
          <button
            type="button"
            onClick={() => void requestNotifications()}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            {t("thisWeek.notificationsEnable")}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link to="/dashboard#admission-checklist" className="font-medium text-indigo-700 underline-offset-2 hover:underline">
          {t("thisWeek.linkChecklist")}
        </Link>
        <Link to="/dashboard#program-grid" className="font-medium text-indigo-700 underline-offset-2 hover:underline">
          {t("thisWeek.linkPrograms")}
        </Link>
      </div>
    </section>
  );
}
