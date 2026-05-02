import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UniversitySearchPanel } from "../components/UniversitySearchPanel";
import { useProfile } from "../context/ProfileContext";

export function LandingPage() {
  const navigate = useNavigate();
  const { universities, setSelectedUniversityId } = useProfile();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-indigo-50/40"
    >
      <div className="mx-auto w-full max-w-[min(100%,960px)] px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">QApp · University Hub</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Выберите университет
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Сначала найдите вуз по названию, городу, типу и бюджету — затем откроется персональный дашборд с программами,
            AI Fit и документами.
          </p>
        </div>

        <div className="mt-12">
          <UniversitySearchPanel
            universities={universities}
            onPickUniversity={(id) => {
              setSelectedUniversityId(id);
              navigate("/dashboard");
            }}
          />
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Уже выбирали вуз?{" "}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
          >
            Перейти в дашборд
          </button>{" "}
          с последним сохранённым вузом.
        </p>
      </div>
    </motion.div>
  );
}
