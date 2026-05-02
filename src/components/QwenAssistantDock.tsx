import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSmartAdvisor } from "../hooks/useSmartAdvisor";
import { isAiConfigured, type QwenChatTurn } from "../services/aiProvider";

const SUGGESTIONS = [
  "Что успеть до дедлайна заявок?",
  "Как мои баллы соотносятся с конкурсом?",
  "Чем грант отличается от контракта в общих чертах?",
];

export function QwenAssistantDock() {
  const { sendAdmissionChat } = useSmartAdvisor();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<QwenChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, open, loading]);

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      if (!isAiConfigured()) {
        setError("Добавьте VITE_API_KEY или включите прокси VITE_USE_AI_PROXY — иначе Qwen недоступен.");
        return;
      }
      setError(null);
      const priorTurns = turns;
      setTurns([...priorTurns, { role: "user", content: trimmed }]);
      setInput("");
      setLoading(true);
      try {
        const reply = await sendAdmissionChat(priorTurns, trimmed);
        setTurns((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Ошибка запроса";
        setError(msg);
        setTurns((prev) => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    },
    [loading, sendAdmissionChat, turns]
  );

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit(input);
  };

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Закрыть чат с Qwen" : "Открыть чат с Qwen"}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg ring-2 ring-white/90 transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
      >
        <span className="text-xs font-bold tracking-tight">Qwen</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-5 z-[60] flex w-[min(100vw-2rem,420px)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-white">
              <div>
                <p className="text-sm font-semibold">Qwen · чат</p>
                <p className="text-xs text-indigo-100">Поступление в вузы Казахстана</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Очистить историю"
                  onClick={() => {
                    setTurns([]);
                    setError(null);
                  }}
                  className="rounded-lg px-2 py-1 text-xs text-indigo-100 hover:bg-white/10"
                >
                  Очистить
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-1 text-sm text-indigo-100 hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
            </div>

            <div ref={listRef} className="max-h-[min(52vh,360px)] space-y-3 overflow-y-auto bg-slate-50/80 px-3 py-3">
              {turns.length === 0 && !loading && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    Спросите про сроки, документы, баллы или выбранный вуз — ответит Qwen 2.5 с учётом вашего профиля.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void submit(s)}
                        disabled={loading || !isAiConfigured()}
                        className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-left text-xs text-indigo-900 shadow-sm hover:bg-indigo-50 disabled:opacity-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {turns.map((t, i) => (
                <div
                  key={`${t.role}-${i}`}
                  className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      t.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 bg-white text-slate-800 shadow-sm"
                    }`}
                  >
                    {t.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                    Печатает…
                  </div>
                </div>
              )}

              {error && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950 ring-1 ring-amber-200">
                  {error}
                </p>
              )}

              {!isAiConfigured() && (
                <p className="text-xs text-slate-500">
                  Укажите ключ в `.env.local` или серверный прокси — см. README.
                </p>
              )}
            </div>

            <form onSubmit={onFormSubmit} className="border-t border-slate-100 bg-white p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ваш вопрос…"
                  disabled={loading}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Отпр.
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
