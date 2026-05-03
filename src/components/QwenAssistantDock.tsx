import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSmartAdvisor } from "../hooks/useSmartAdvisor";
import { isAiConfigured, type QwenChatTurn } from "../services/aiProvider";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function QwenAssistantDock() {
  const { t } = useTranslation();
  const suggestions = useMemo(() => [t("qwen.sugg1"), t("qwen.sugg2"), t("qwen.sugg3")], [t]);
  const { sendAdmissionChat } = useSmartAdvisor();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<QwenChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevOpen = useRef(false);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, open, loading]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (prevOpen.current && !open) {
      fabRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const root = panelRef.current;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!root.contains(active)) return;
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      if (!isAiConfigured()) {
        setError(t("qwen.errNoKey"));
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
        const msg = e instanceof Error ? e.message : t("qwen.requestError");
        setError(msg);
        setTurns((prev) => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    },
    [loading, sendAdmissionChat, turns, t]
  );

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit(input);
  };

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="qwen-assistant-panel"
        aria-label={open ? t("qwen.fabClose") : t("qwen.fabOpen")}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg ring-2 ring-white/90 transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
      >
        <span className="text-xs font-bold tracking-tight">Qwen</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id="qwen-assistant-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qwen-assistant-title"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-5 z-[60] flex w-[min(100vw-2rem,420px)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-white">
              <div>
                <p id="qwen-assistant-title" className="text-sm font-semibold">
                  {t("qwen.title")}
                </p>
                <p className="text-xs text-indigo-100">{t("qwen.subtitle")}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={t("qwen.clear")}
                  title={t("qwen.clear")}
                  onClick={() => {
                    setTurns([]);
                    setError(null);
                  }}
                  className="rounded-lg px-2 py-1 text-xs text-indigo-100 hover:bg-white/10"
                >
                  {t("qwen.clear")}
                </button>
                <button
                  type="button"
                  aria-label={t("qwen.close")}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-1 text-sm text-indigo-100 hover:bg-white/10"
                >
                  {t("qwen.close")}
                </button>
              </div>
            </div>

            <div
              ref={listRef}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              className="max-h-[min(52vh,360px)] space-y-3 overflow-y-auto bg-slate-50/80 px-3 py-3"
            >
              {turns.length === 0 && !loading && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">{t("qwen.intro")}</p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label={t("qwen.suggestionsGroup")}>
                    {suggestions.map((s) => (
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

              {turns.map((turn, i) => (
                <div
                  key={`${turn.role}-${i}`}
                  className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    role={turn.role === "user" ? undefined : "article"}
                    aria-label={turn.role === "user" ? t("qwen.msgYou") : t("qwen.msgAssistant")}
                    className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      turn.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 bg-white text-slate-800 shadow-sm"
                    }`}
                  >
                    {turn.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm"
                    aria-busy="true"
                  >
                    {t("qwen.typing")}
                  </div>
                </div>
              )}

              {error && (
                <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950 ring-1 ring-amber-200">
                  {error}
                </p>
              )}

              {!isAiConfigured() && (
                <p className="text-xs text-slate-500">{t("qwen.envHint")}</p>
              )}
            </div>

            <form onSubmit={onFormSubmit} className="border-t border-slate-100 bg-white p-3">
              <div className="flex gap-2">
                <label htmlFor="qwen-chat-input" className="sr-only">
                  {t("qwen.inputLabel")}
                </label>
                <input
                  ref={inputRef}
                  id="qwen-chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("qwen.placeholder")}
                  disabled={loading}
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {t("qwen.send")}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
