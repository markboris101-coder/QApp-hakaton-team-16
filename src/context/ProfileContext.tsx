import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { UNIVERSITIES, currentStudent } from "../mockData";
import type { StudentProfile, UniversityTemplate } from "../mockData";
import * as documentStorage from "../lib/documentStorage";
import { fetchServerProfile, saveServerProfile } from "../lib/backendApi";
import { clampGpa, clampSat, clampUnt, roundIeltsHalfBand } from "../lib/academicInput";
import { EMPTY_ACHIEVEMENT_PROFILE } from "../lib/achievementProfile";

const SHORTLIST_KEY = "sup-program-shortlist";
const SELECTED_UNI_KEY = "sup-selected-university";
const FAVORITE_UNIS_KEY = "qapp-favorite-universities";

/** Совместимость со старыми сохранёнными профилями (новые поля). */
function normalizeProfile(raw: StudentProfile): StudentProfile {
  const mergedAcademic = {
    ...currentStudent.academic,
    ...(raw.academic ?? {}),
  };
  return {
    ...currentStudent,
    ...raw,
    academic: {
      ...mergedAcademic,
      gpa: clampGpa(mergedAcademic.gpa),
      ielts: roundIeltsHalfBand(mergedAcademic.ielts),
      sat: clampSat(mergedAcademic.sat),
      untScore: clampUnt(mergedAcademic.untScore),
    },
    preferences: {
      ...currentStudent.preferences,
      ...(raw.preferences ?? {}),
      financialStatus:
        raw.preferences?.financialStatus ?? currentStudent.preferences.financialStatus,
    },
    awards: Array.isArray(raw.awards) ? raw.awards : [],
    olympiadVerified: raw.olympiadVerified === true,
    achievementProfile: {
      ...EMPTY_ACHIEVEMENT_PROFILE,
      ...(raw.achievementProfile ?? {}),
    },
    documents: { ...currentStudent.documents, ...(raw.documents ?? {}) },
    documentUploads: raw.documentUploads ?? {},
  };
}

type ProfileContextValue = {
  student: StudentProfile;
  /** Активный вуз дашборда (MVP: мок-список) */
  universityData: UniversityTemplate;
  setStudent: React.Dispatch<React.SetStateAction<StudentProfile>>;
  /** Все вузы для поиска / переключателя */
  universities: UniversityTemplate[];
  selectedUniversityId: string;
  setSelectedUniversityId: (id: string) => void;
  shortlist: string[];
  toggleShortlist: (programId: string) => void;
  isShortlisted: (programId: string) => boolean;
  /** Избранные вузы (localStorage), отдельно от избранных программ */
  favoriteUniversityIds: string[];
  toggleFavoriteUniversity: (universityId: string) => void;
  isFavoriteUniversity: (universityId: string) => boolean;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<StudentProfile>(currentStudent);
  const [persistReady, setPersistReady] = useState(false);
  const [selectedUniversityId, setSelectedUniversityIdState] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(SELECTED_UNI_KEY);
      if (raw && UNIVERSITIES.some((u) => u.id === raw)) return raw;
    } catch {
      /* ignore */
    }
    return UNIVERSITIES[0].id;
  });

  const setSelectedUniversityId = useCallback((id: string) => {
    if (UNIVERSITIES.some((u) => u.id === id)) {
      setSelectedUniversityIdState(id);
    }
  }, []);

  const [shortlist, setShortlist] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SHORTLIST_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [favoriteUniversityIds, setFavoriteUniversityIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITE_UNIS_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw) as unknown;
      if (!Array.isArray(arr)) return [];
      return arr.filter((id): id is string => typeof id === "string" && UNIVERSITIES.some((u) => u.id === id));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(shortlist));
  }, [shortlist]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITE_UNIS_KEY, JSON.stringify(favoriteUniversityIds));
    } catch {
      /* ignore */
    }
  }, [favoriteUniversityIds]);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_UNI_KEY, selectedUniversityId);
    } catch {
      /* ignore */
    }
  }, [selectedUniversityId]);

  const universityData = useMemo(
    () => UNIVERSITIES.find((u) => u.id === selectedUniversityId) ?? UNIVERSITIES[0],
    [selectedUniversityId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let merged: StudentProfile =
          typeof indexedDB === "undefined"
            ? currentStudent
            : normalizeProfile(await documentStorage.loadMergedStudent(currentStudent));

        const remote = await fetchServerProfile();
        if (remote && !cancelled) {
          merged = normalizeProfile({
            ...merged,
            ...remote.student,
            documents: merged.documents,
            documentUploads: merged.documentUploads,
          });
        }

        if (!cancelled) setStudent(merged);
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

  useEffect(() => {
    if (!persistReady) return;
    const handle = window.setTimeout(() => {
      void saveServerProfile(student).catch(() => undefined);
    }, 900);
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

  const toggleFavoriteUniversity = useCallback((universityId: string) => {
    if (!UNIVERSITIES.some((u) => u.id === universityId)) return;
    setFavoriteUniversityIds((prev) =>
      prev.includes(universityId) ? prev.filter((id) => id !== universityId) : [...prev, universityId]
    );
  }, []);

  const isFavoriteUniversity = useCallback(
    (universityId: string) => favoriteUniversityIds.includes(universityId),
    [favoriteUniversityIds]
  );

  const value = useMemo(
    () => ({
      student,
      universityData,
      setStudent,
      universities: UNIVERSITIES,
      selectedUniversityId,
      setSelectedUniversityId,
      shortlist,
      toggleShortlist,
      isShortlisted,
      favoriteUniversityIds,
      toggleFavoriteUniversity,
      isFavoriteUniversity,
    }),
    [
      student,
      universityData,
      selectedUniversityId,
      setSelectedUniversityId,
      shortlist,
      toggleShortlist,
      isShortlisted,
      favoriteUniversityIds,
      toggleFavoriteUniversity,
      isFavoriteUniversity,
    ]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
