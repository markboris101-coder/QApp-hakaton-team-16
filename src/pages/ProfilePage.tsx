import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProfile } from "../context/ProfileContext";
import { ProfileEditorForm } from "../components/ProfileEditorForm";

const SHELL = "mx-auto w-full max-w-[min(100%,1400px)] px-4 sm:px-6";

export function ProfilePage() {
  const navigate = useNavigate();
  const {
    student,
    setStudent,
    universityData,
    universities,
    favoriteUniversityIds,
    toggleFavoriteUniversity,
    setSelectedUniversityId,
  } = useProfile();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900"
    >
      <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
        <div className={`${SHELL} flex flex-wrap items-center justify-between gap-3 py-4`}>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              ← На главную
            </Link>
            <span className="text-sm text-slate-500">{universityData.name}</span>
          </div>
          <p className="text-xs text-slate-500">Изменения сохраняются автоматически</p>
        </div>
      </header>

      <div className={`${SHELL} py-10`}>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Профиль абитуриента</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Все поля влияют на расчёт AI Fit, стипендий и советов Qwen. Разметка — на всю ширину окна (до 1400px).
        </p>

        {favoriteUniversityIds.length > 0 && (
          <section className="mt-10 rounded-2xl border border-amber-200/90 bg-amber-50/50 p-5 ring-1 ring-amber-100/80">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900">Избранные вузы</h2>
            <p className="mt-1 text-sm text-amber-950/80">
              Сохраняются в этом браузере. Это не то же самое, что избранные программы (шорт-лист).
            </p>
            <ul className="mt-4 space-y-2">
              {favoriteUniversityIds.map((id) => {
                const u = universities.find((x) => x.id === id);
                if (!u) return null;
                return (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200/80 bg-white px-3 py-2.5"
                  >
                    <span className="text-sm font-medium text-slate-900">{u.name}</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUniversityId(u.id);
                          navigate("/dashboard");
                        }}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        Дашборд
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavoriteUniversity(u.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Убрать
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Link to="/" className="mt-3 inline-block text-sm font-medium text-indigo-700 hover:underline">
              Каталог вузов →
            </Link>
          </section>
        )}

        <div className="mt-10">
          <ProfileEditorForm student={student} onStudentChange={setStudent} />
        </div>
      </div>
    </motion.div>
  );
}
