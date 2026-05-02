import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProfile } from "../context/ProfileContext";
import { ProfileEditorForm } from "../components/ProfileEditorForm";

const SHELL = "mx-auto w-full max-w-[min(100%,1400px)] px-4 sm:px-6";

export function ProfilePage() {
  const { student, setStudent, universityData } = useProfile();

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
        <div className="mt-10">
          <ProfileEditorForm student={student} onStudentChange={setStudent} />
        </div>
      </div>
    </motion.div>
  );
}
