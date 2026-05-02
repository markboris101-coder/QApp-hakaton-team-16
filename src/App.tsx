import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ProfileProvider } from "./context/ProfileContext";
import { HomePage } from "./pages/HomePage";
import { ProgramDetailsPage } from "./pages/ProgramDetailsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { MainNav } from "./components/MainNav";

function AppLayout() {
  return (
    <>
      <MainNav />
      <Outlet />
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
            <Route path="/" element={<HomePage />} />
            <Route path="/program/:id" element={<ProgramDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
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
