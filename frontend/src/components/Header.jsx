import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../App";

const titles = {
  "/dashboard": "Dashboard",
  "/upload":    "Upload Dataset",
  "/pipeline":  "ETL Pipeline",
  "/query":     "AI Query",
  "/profile":   "Data Profile",
  "/insights":  "AI Insights",
};

export default function Header() {
  const { pathname }                          = useLocation();
  const navigate                              = useNavigate();
  const { dataset, isDark, toggleTheme, logout, userEmail, mobileOpen, setMobileOpen } = useApp();
  const title                                 = titles[pathname] ?? "DataPulse AI";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef                     = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const initial = userEmail ? userEmail[0].toUpperCase() : "A";

  return (
    <header
      className="flex items-center gap-3 px-4 flex-shrink-0 theme-tr"
      style={{
        height: "56px",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Hamburger — mobile only */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <h1 className="font-bold text-base flex-1 min-w-0 truncate text-gradient">{title}</h1>

      {/* Dataset badge */}
      {dataset && (
        <div
          className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5 theme-tr"
          style={{
            background: "rgba(233,30,140,0.08)",
            border: "1px solid rgba(233,30,140,0.25)",
            flexShrink: 0,
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
            style={{ background: "var(--green)", boxShadow: "0 0 6px rgba(0,255,136,0.5)" }}
          />
          <span className="text-xs font-medium truncate" style={{ maxWidth: 140, color: "var(--pink)" }}>
            {dataset.filename}
          </span>
          <span className="dataset-rows text-xs" style={{ color: "var(--muted)", flexShrink: 0 }}>
            {dataset.rows?.toLocaleString()} rows
          </span>
        </div>
      )}

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="flex items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0"
        style={{
          width: 36, height: 36, minHeight: 36,
          background: "rgba(233,30,140,0.1)",
          border: "1px solid rgba(233,30,140,0.25)",
          color: "var(--pink)", cursor: "pointer", fontSize: 16,
          boxShadow: "0 0 12px var(--glow-pink)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 22px var(--glow-pink), 0 0 40px var(--glow-purple)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 12px var(--glow-pink)"; }}
      >
        {isDark ? "☀️" : "🌙"}
      </button>

      {/* Avatar + dropdown */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center justify-center rounded-full text-xs font-black text-white cursor-pointer"
          style={{
            width: 34, height: 34, minHeight: 34,
            background: "linear-gradient(135deg, var(--pink), var(--purple))",
            boxShadow: dropdownOpen
              ? "0 0 20px var(--glow-pink), 0 0 40px var(--glow-purple)"
              : "0 0 14px var(--glow-pink)",
            border: "none",
            transition: "box-shadow 0.2s",
          }}
          aria-label="User menu"
        >
          {initial}
        </button>

        {dropdownOpen && (
          <div className="dropdown-menu">
            {/* User info */}
            {userEmail && (
              <div
                className="px-3 py-2 mb-1 rounded-lg"
                style={{ background: "rgba(233,30,140,0.06)", borderBottom: "1px solid var(--border)" }}
              >
                <div className="text-xs font-semibold text-gradient truncate">{userEmail}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>Signed in</div>
              </div>
            )}

            <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
              👤 Profile
            </button>
            <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
              ⚙️ Settings
            </button>
            <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
            <button className="dropdown-item danger" onClick={handleLogout}>
              🚪 Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
