import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ProfileProvider } from "./context/ProfileContext";
import { AssistantIntakeProvider } from "./context/AssistantIntakeContext";
import { LandingPage } from "./pages/LandingPage";
import { HomePage } from "./pages/HomePage";
import { ProgramDetailsPage } from "./pages/ProgramDetailsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { BlogPage } from "./pages/BlogPage";
import { MainNav } from "./components/MainNav";
import { QwenAssistantDock } from "./components/QwenAssistantDock";
import { PlatformFooter } from "./components/PlatformFooter";
import { RequireIntakeComplete } from "./components/RequireIntakeComplete";
import { useAssistantIntake } from "./context/AssistantIntakeContext";

function AppLayout() {
  const { hydrated, intakeDone } = useAssistantIntake();
  const aiOpen = hydrated && intakeDone;

  return (
    <>
      <MainNav />
      <Outlet />
      <PlatformFooter />
      {aiOpen ? <QwenAssistantDock /> : null}
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
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
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route element={<RequireIntakeComplete />}>
              <Route path="/dashboard" element={<HomePage />} />
              <Route path="/program/:id" element={<ProgramDetailsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/blog" element={<BlogPage />} />
            </Route>
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <AssistantIntakeProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AssistantIntakeProvider>
    </ProfileProvider>
  );
}
