import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ProfileProvider } from "./context/ProfileContext";
import { StudentProfileEditor } from "./components/StudentProfileEditor";
import { HomePage } from "./pages/HomePage";
import { ProgramDetailsPage } from "./pages/ProgramDetailsPage";
import { useProfile } from "./context/ProfileContext";

function AnimatedRoutes() {
  const location = useLocation();
  const { student, setStudent, editorOpen, setEditorOpen } = useProfile();

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="min-h-screen"
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/program/:id" element={<ProgramDetailsPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <StudentProfileEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        student={student}
        onStudentChange={setStudent}
      />
    </>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ProfileProvider>
  );
}
