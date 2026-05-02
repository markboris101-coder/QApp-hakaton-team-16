import React, { useEffect, useMemo, useState } from "react";
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

function formatWeekdayDate(iso: string): string {
  const d = new Date(iso + (iso.includes("T") ? "" : "T12:00:00"));
  return d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function ThisWeekPanel({
  universityId,
  universityName,
  applicationDeadlineIso,
  documents,
  shortlistCount,
  favoriteUniversityCount,
}: Props) {
  const daysLeft = useMemo(() => daysUntilDeadline(applicationDeadlineIso), [applicationDeadlineIso]);

  const missingLabels = useMemo(
    () =>
      DOCUMENT_ENTRIES.filter((e) => documents[e.key] !== "READY").map((e) => e.labelRu),
    [documents]
  );

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
              ? "Сегодня дедлайн заявок — проверьте документы и отправку."
              : `До дедлайна заявок осталось ${daysLeft} дн. Недостаёт документов: ${missingLabels.length}.`,
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
  }, [universityId, universityName, applicationDeadlineIso, daysLeft, missingLabels.length]);

  const tasks: string[] = [];
  if (daysLeft < 0) {
    tasks.push("Официальный дедлайн заявок в календаре прошёл — уточните позднюю подачу или следующий набор в приёмной комиссии.");
  } else if (daysLeft <= 7) {
    tasks.push(`Дедлайн заявок скоро (${daysLeft} дн.) — проверьте портал приёма ${universityName}.`);
  } else {
    tasks.push(
      `До дедлайна (${formatWeekdayDate(applicationDeadlineIso)}) ещё ${daysLeft} дн. — соберите документы без спешки.`
    );
  }
  if (missingLabels.length > 0) {
    tasks.push(`Догрузите в чек-листе: ${missingLabels.slice(0, 3).join(", ")}${missingLabels.length > 3 ? "…" : "."}`);
  }
  if (shortlistCount === 0) {
    tasks.push("Добавьте программы в избранное на странице программы — удобнее сравнивать fit перед подачей.");
  }
  if (favoriteUniversityCount === 0) {
    tasks.push("В каталоге нажмите ☆ у вуза, чтобы добавить его в «Избранные вузы» и переключаться с дашборда.");
  }
  if (tasks.length < 3) {
    tasks.push("Обновите профиль, если изменились GPA, IELTS или награды — пересчитается AI Fit.");
  }

  const requestNotifications = async () => {
    if (typeof Notification === "undefined") {
      window.alert("Браузер не поддерживает уведомления.");
      return;
    }
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p === "granted") {
      try {
        new Notification("QApp", {
          body: "Напоминания включены: раз в день (пока открыта вкладка) при приближении дедлайна.",
        });
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <section className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 p-6 shadow-sm ring-1 ring-indigo-100/80 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">План недели</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-900">Что сделать на этой неделе</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
        Короткий список по текущему вузу и вашему прогрессу. Дедлайн:{" "}
        <span className="font-medium text-slate-800">{formatWeekdayDate(applicationDeadlineIso)}</span>
        {daysLeft >= 0 ? (
          <>
            {" "}
            (<span className="tabular-nums font-semibold text-indigo-800">{daysLeft}</span> дн.)
          </>
        ) : null}
        .
      </p>

      <ol className="mt-6 space-y-3">
        {tasks.map((t, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-sm"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {i + 1}
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-3 border-t border-indigo-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          <span className="font-medium text-slate-800">Напоминания в браузере</span>
          {permission === "granted" ? (
            <p className="mt-1 text-xs text-emerald-800">Включены: до одного сообщения в день, пока вкладка открыта.</p>
          ) : permission === "denied" ? (
            <p className="mt-1 text-xs text-amber-900">
              В браузере запрещены — разрешите в настройках сайта, если нужны пуши.
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-600">Опционально: мягкое напоминание о дедлайне и документах.</p>
          )}
        </div>
        {permission !== "granted" && (
          <button
            type="button"
            onClick={() => void requestNotifications()}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Включить уведомления
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link to="/dashboard#admission-checklist" className="font-medium text-indigo-700 underline-offset-2 hover:underline">
          Чек-лист документов →
        </Link>
        <Link to="/dashboard#program-grid" className="font-medium text-indigo-700 underline-offset-2 hover:underline">
          Сетка программ →
        </Link>
      </div>
    </section>
  );
}
