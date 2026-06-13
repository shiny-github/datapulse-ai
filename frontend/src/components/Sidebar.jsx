import React from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../App";

const links = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/upload",    icon: "⬆️",  label: "Upload" },
  { to: "/pipeline",  icon: "⚙️",  label: "Pipeline" },
  { to: "/query",     icon: "🤖",  label: "AI Query" },
  { to: "/profile",   icon: "🔍",  label: "Data Profile" },
  { to: "/insights",  icon: "💡",  label: "Insights" },
];

export default function Sidebar() {
  const { mobileOpen, setMobileOpen } = useApp();

  return (
    <aside
      className={`sidebar-wrapper flex-shrink-0 flex flex-col sidebar-glow theme-tr ${mobileOpen ? "mobile-open" : ""}`}
      style={{
        width: "220px",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo row — mobile has close button */}
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-center font-black text-sm rounded-xl"
          style={{
            width: 36, height: 36, flexShrink: 0,
            background: "linear-gradient(135deg, var(--pink), var(--purple))",
            color: "#fff",
            boxShadow: "0 0 18px var(--glow-pink)",
          }}
        >
          DP
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm leading-none text-gradient">DataPulse</div>
          <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>AI Analytics</div>
        </div>
        {/* Close button — only visible on mobile via CSS */}
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen(false)}
          style={{ display: "flex", width: 32, height: 32, minHeight: 32, fontSize: 14, flexShrink: 0 }}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={({ isActive }) =>
              isActive
                ? {
                    background: "rgba(233,30,140,0.12)",
                    color: "var(--pink)",
                    border: "1px solid rgba(233,30,140,0.3)",
                    boxShadow: "0 0 16px var(--glow-pink)",
                  }
                : { color: "var(--muted)", border: "1px solid transparent" }
            }
          >
            <span style={{ fontSize: 16 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div
        className="px-4 py-3 text-center text-xs theme-tr"
        style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}
      >
        Groq · ChromaDB · Azure
      </div>
    </aside>
  );
}
