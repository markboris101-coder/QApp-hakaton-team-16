import React, { useEffect, useState } from "react";
import type { ScholarshipInfo } from "../mockData";
import { useProfile } from "../context/ProfileContext";
import { useSmartAdvisor } from "../hooks/useSmartAdvisor";
import { TextSkeleton } from "./TextSkeleton";
import { isAiConfigured } from "../services/aiProvider";

function ScholarshipAiNote({ scholarship }: { scholarship: ScholarshipInfo }) {
  const { getScholarshipAdvice } = useSmartAdvisor();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    setText("");

    if (!isAiConfigured()) {
      setText(
        "Добавьте `VITE_API_KEY` локально или в env деплоя — тогда Qwen объяснит связь олимпиады со стипендией."
      );
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const t = await getScholarshipAdvice(scholarship.name);
        if (!cancelled) setText(t);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Ошибка ИИ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scholarship.name, getScholarshipAdvice]);

  return (
    <div className="mt-4 rounded-xl bg-white/80 px-3 py-2.5 ring-1 ring-slate-200/80">
      <p className="text-xs font-semibold text-indigo-700">AI · Qwen · Olympiad &amp; scholarship</p>
      {loading ? (
        <div className="mt-2">
          <TextSkeleton lines={3} />
        </div>
      ) : err ? (
        <p className="mt-2 text-sm text-red-600">{err}</p>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{text}</p>
      )}
    </div>
  );
}

export function ScholarshipsSection() {
  const { universityData } = useProfile();
  const scholarships = universityData.scholarships;

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">10.G</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-900">Scholarships</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
        Релевантность по профилю; для каждой стипендии Qwen объясняет, как награда «Olympiad Winner» может усилить заявку.
      </p>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2">
        {scholarships.map((s) => {
          const isTop = s.aiRelevance === "High";
          return (
            <li
              key={s.name}
              className={`relative flex flex-col rounded-2xl p-5 transition-shadow ${
                isTop
                  ? "border-2 border-amber-400/90 bg-gradient-to-br from-amber-50/90 to-white shadow-md ring-1 ring-amber-200/50"
                  : "border border-slate-200 bg-slate-50/50 shadow-sm hover:shadow-md"
              }`}
            >
              {isTop && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-amber-500 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow">
                  Top choice for you
                </span>
              )}
              <h3 className="pr-2 text-base font-semibold text-slate-900">{s.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{s.requirements}</p>
              <ScholarshipAiNote scholarship={s} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
