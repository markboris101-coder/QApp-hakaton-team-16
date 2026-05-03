import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { recordIntakeCompleted } from "../lib/demoAnalytics";

export const ASSISTANT_INTAKE_KEY = "qapp-assistant-intake-complete";

type AssistantIntakeContextValue = {
  hydrated: boolean;
  intakeDone: boolean;
  markIntakeComplete: () => void;
  resetIntake: () => void;
};

const AssistantIntakeContext = createContext<AssistantIntakeContextValue | null>(null);

export function AssistantIntakeProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [intakeDone, setIntakeDone] = useState(false);

  useEffect(() => {
    try {
      setIntakeDone(localStorage.getItem(ASSISTANT_INTAKE_KEY) === "1");
    } catch {
      setIntakeDone(false);
    }
    setHydrated(true);
  }, []);

  const markIntakeComplete = useCallback(() => {
    try {
      localStorage.setItem(ASSISTANT_INTAKE_KEY, "1");
    } catch {
      /* ignore */
    }
    recordIntakeCompleted();
    setIntakeDone(true);
  }, []);

  const resetIntake = useCallback(() => {
    try {
      localStorage.removeItem(ASSISTANT_INTAKE_KEY);
    } catch {
      /* ignore */
    }
    setIntakeDone(false);
  }, []);

  const value = useMemo(
    () => ({ hydrated, intakeDone, markIntakeComplete, resetIntake }),
    [hydrated, intakeDone, markIntakeComplete, resetIntake]
  );

  return <AssistantIntakeContext.Provider value={value}>{children}</AssistantIntakeContext.Provider>;
}

export function useAssistantIntake(): AssistantIntakeContextValue {
  const ctx = useContext(AssistantIntakeContext);
  if (!ctx) throw new Error("useAssistantIntake must be used within AssistantIntakeProvider");
  return ctx;
}
