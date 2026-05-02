import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";

export function MainNav() {
  const location = useLocation();
  const {
    universities,
    selectedUniversityId,
    setSelectedUniversityId,
    universityData,
    student,
  } = useProfile();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return universities;
    return universities.filter(
      (u) =>
        u.name.toLowerCase().includes(t) ||
        u.city.toLowerCase().includes(t) ||
        u.type.toLowerCase().includes(t)
    );
  }, [universities, q]);

  const onHome = location.pathname === "/";

  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[min(100%,1400px)] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="rounded-lg bg-indigo-600 px-2 py-1 text-xs text-white">QApp</span>
          <span className="hidden sm:inline">University Hub</span>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center gap-1 sm:gap-2" aria-label="Main">
          <Link
            to="/"
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              onHome ? "bg-indigo-50 text-indigo-800" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            Главная
          </Link>
          {onHome ? (
            <>
              <a
                href="/#ai-fit-card"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                AI Fit
              </a>
              <a
                href="/#program-grid"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Программы
              </a>
              <a
                href="/#admission-checklist"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Документы
              </a>
            </>
          ) : (
            <>
              <Link
                to="/#program-grid"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Программы
              </Link>
              <Link
                to="/#admission-checklist"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Чек-лист
              </Link>
            </>
          )}
          <Link
            to="/profile"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Профиль
          </Link>
        </nav>

        <div className="relative flex min-w-0 flex-1 basis-full items-center gap-2 sm:basis-auto sm:flex-none lg:min-w-[280px]">
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-600 sm:max-w-xs"
          >
            <span className="block truncate">
              <span className="font-medium text-slate-900">{universityData.name}</span>
              <span className="text-slate-500"> · {universityData.city}</span>
            </span>
            <span className="text-xs text-slate-500">Поиск вуза ▾</span>
          </button>
          {searchOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-full min-w-[min(100vw-2rem,360px)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:w-[380px]">
              <label className="sr-only" htmlFor="uni-search">
                Поиск университетов
              </label>
              <input
                id="uni-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Название, город, тип…"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                autoFocus
              />
              <ul className="mt-2 max-h-64 overflow-y-auto">
                {filtered.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUniversityId(u.id);
                        setSearchOpen(false);
                        setQ("");
                      }}
                      className={`flex w-full flex-col rounded-xl px-3 py-2 text-left text-sm transition hover:bg-indigo-50 ${
                        u.id === selectedUniversityId ? "bg-indigo-50 ring-1 ring-indigo-200" : ""
                      }`}
                    >
                      <span className="font-medium text-slate-900">{u.name}</span>
                      <span className="text-xs text-slate-600">
                        {u.city} · {u.type} · {u.programs.length} программ
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {filtered.length === 0 && (
                <p className="py-4 text-center text-sm text-slate-500">Ничего не найдено</p>
              )}
            </div>
          )}
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
