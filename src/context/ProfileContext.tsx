import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { currentStudent, universityData as universityDataStatic } from "../mockData";
import type { StudentProfile, UniversityTemplate } from "../mockData";
import * as documentStorage from "../lib/documentStorage";

const SHORTLIST_KEY = "sup-program-shortlist";

/** Совместимость со старыми сохранёнными профилями (новые поля). */
function normalizeProfile(raw: StudentProfile): StudentProfile {
  return {
    ...currentStudent,
    ...raw,
    academic: {
      ...currentStudent.academic,
      ...(raw.academic ?? {}),
      untScore: raw.academic?.untScore ?? currentStudent.academic.untScore,
    },
    preferences: {
      ...currentStudent.preferences,
      ...(raw.preferences ?? {}),
      financialStatus:
        raw.preferences?.financialStatus ?? currentStudent.preferences.financialStatus,
    },
    awards: Array.isArray(raw.awards) ? raw.awards : [],
    documents: { ...currentStudent.documents, ...(raw.documents ?? {}) },
    documentUploads: raw.documentUploads ?? {},
  };
}

type ProfileContextValue = {
  student: StudentProfile;
  /** Шаблон университета (SSOT из mockData) */
  universityData: UniversityTemplate;
  setStudent: React.Dispatch<React.SetStateAction<StudentProfile>>;
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
  shortlist: string[];
  toggleShortlist: (programId: string) => void;
  isShortlisted: (programId: string) => boolean;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<StudentProfile>(currentStudent);
  const [editorOpen, setEditorOpen] = useState(false);
  const [persistReady, setPersistReady] = useState(false);
  const [shortlist, setShortlist] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SHORTLIST_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(shortlist));
  }, [shortlist]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof indexedDB === "undefined") {
        setPersistReady(true);
        return;
      }
      try {
        const merged = await documentStorage.loadMergedStudent(currentStudent);
        if (!cancelled) setStudent(normalizeProfile(merged));
      } catch (e) {
        console.warn("Initial profile load failed", e);
      } finally {
        if (!cancelled) setPersistReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!persistReady || typeof indexedDB === "undefined") return;
    const handle = window.setTimeout(() => {
      void documentStorage.saveStudentProfile(student).catch((e) => console.warn("Profile save failed", e));
    }, 450);
    return () => clearTimeout(handle);
  }, [student, persistReady]);

  const toggleShortlist = useCallback((programId: string) => {
    setShortlist((prev) =>
      prev.includes(programId) ? prev.filter((id) => id !== programId) : [...prev, programId]
    );
  }, []);

  const isShortlisted = useCallback(
    (programId: string) => shortlist.includes(programId),
    [shortlist]
  );

  const value = useMemo(
    () => ({
      student,
      universityData: universityDataStatic,
      setStudent,
      editorOpen,
      setEditorOpen,
      shortlist,
      toggleShortlist,
      isShortlisted,
    }),
    [student, editorOpen, shortlist, toggleShortlist, isShortlisted]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
