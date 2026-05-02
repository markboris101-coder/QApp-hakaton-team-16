import { useCallback, useEffect, useState } from "react";

export const ASSISTANT_INTAKE_KEY = "qapp-assistant-intake-complete";

export function useAssistantIntake() {
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

  return { hydrated, intakeDone, markIntakeComplete, resetIntake };
}
