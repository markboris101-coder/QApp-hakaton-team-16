import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";

export function FavoriteUniversitiesBar() {
  const navigate = useNavigate();
  const {
    universities,
    favoriteUniversityIds,
    selectedUniversityId,
    setSelectedUniversityId,
    toggleFavoriteUniversity,
  } = useProfile();

  if (favoriteUniversityIds.length === 0) return null;

  const items = favoriteUniversityIds
    .map((id) => universities.find((u) => u.id === id))
    .filter(Boolean);

  return (
    <section className="mb-10 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 to-white p-4 shadow-sm ring-1 ring-amber-100/80 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Избранное</p>
          <h2 className="mt-0.5 text-base font-semibold text-slate-900">Избранные вузы</h2>
          <p className="mt-1 text-sm text-slate-600">
            Быстрый переход между сохранёнными вузами (отдельно от избранных программ).
          </p>
        </div>
        <Link
          to="/"
          className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-semibold text-indigo-700 shadow-sm hover:bg-slate-50"
        >
          Каталог
        </Link>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((u) => {
          if (!u) return null;
          const active = u.id === selectedUniversityId;
          return (
            <li key={u.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedUniversityId(u.id);
                  navigate("/dashboard");
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {u.name.split("(")[0].trim()}
                {active ? " · текущий" : ""}
              </button>
              <button
                type="button"
                onClick={() => toggleFavoriteUniversity(u.id)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-700"
                title="Убрать из избранного"
                aria-label={`Убрать ${u.name} из избранных вузов`}
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
