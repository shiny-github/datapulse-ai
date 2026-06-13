import React, { useState, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Particles from "./components/Particles";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import AIQuery from "./pages/AIQuery";
import Upload from "./pages/Upload";
import DataProfile from "./pages/DataProfile";
import Insights from "./pages/Insights";
import Login from "./pages/Login";
import Home from "./pages/Home";

export const AppContext = createContext(null);
export function useApp() { return useContext(AppContext); }

export default function App() {
  const [dataset, setDataset]       = useState(null);
  const [isDark, setIsDark]         = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("dp_auth") === "true"
  );
  const [userEmail, setUserEmail] = useState(
    () => localStorage.getItem("dp_user") || ""
  );

  const login = (email) => {
    localStorage.setItem("dp_auth", "true");
    localStorage.setItem("dp_user", email);
    setIsLoggedIn(true);
    setUserEmail(email);
    setDataset(null);
  };

  const logout = () => {
    localStorage.removeItem("dp_auth");
    localStorage.removeItem("dp_user");
    setIsLoggedIn(false);
    setUserEmail("");
  };

  const toggleTheme = () => setIsDark((d) => !d);

  const ctx = {
    dataset, setDataset,
    isDark, toggleTheme,
    isLoggedIn, login, logout, userEmail,
    mobileOpen, setMobileOpen,
  };

  return (
    <AppContext.Provider value={ctx}>
      <div data-theme={isDark ? "dark" : "light"} style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <BrowserRouter>
          <Routes>
            {/* Public routes — no shell */}
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
            />

            {/* Protected app shell routes */}
            <Route
              path="/*"
              element={
                isLoggedIn
                  ? <AppShell isDark={isDark} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
                  : <Navigate to="/login" replace />
              }
            />
          </Routes>
        </BrowserRouter>
      </div>
    </AppContext.Provider>
  );
}

function AppShell({ isDark, mobileOpen, setMobileOpen }) {
  return (
    <>
      <div className="app-bg" />
      <Particles isDark={isDark} />

      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          style={{ display: "block" }}
        />
      )}

      <div className="flex h-screen overflow-hidden" style={{ position: "relative", zIndex: 1 }}>
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload"    element={<Upload />} />
              <Route path="/pipeline"  element={<Pipeline />} />
              <Route path="/query"     element={<AIQuery />} />
              <Route path="/profile"   element={<DataProfile />} />
              <Route path="/insights"  element={<Insights />} />
              <Route path="*"          element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}
