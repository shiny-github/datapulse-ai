import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../App";
import Particles from "../components/Particles";

export default function Login() {
  const { login, isDark, toggleTheme } = useApp();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    setError(""); setLoading(true);
    // Simulate async (demo — any credentials work)
    await new Promise((r) => setTimeout(r, 800));
    login(email.trim());
    navigate("/upload", { replace: true });
  };

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div className="app-bg" />
      <Particles isDark={isDark} />

      {/* Theme toggle top-right */}
      <button
        onClick={toggleTheme}
        className="hamburger-btn"
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 10,
          display: "flex",
        }}
        title="Toggle theme"
      >
        {isDark ? "☀️" : "🌙"}
      </button>

      <div
        className="card fade-in w-full relative"
        style={{
          maxWidth: 420,
          margin: "1rem",
          zIndex: 1,
          padding: "2.5rem 2rem",
          boxShadow: "0 0 60px var(--glow-pink), 0 0 120px var(--glow-purple), 0 20px 60px rgba(0,0,0,0.5)",
          borderColor: "rgba(233,30,140,0.4)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center font-black text-xl rounded-2xl mb-4"
            style={{
              width: 64, height: 64,
              background: "linear-gradient(135deg, var(--pink), var(--purple))",
              color: "#fff",
              boxShadow: "0 0 30px var(--glow-pink), 0 0 60px var(--glow-purple)",
            }}
          >
            DP
          </div>
          <h1 className="text-2xl font-black text-gradient mb-1">DataPulse AI</h1>
          <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
            Sign in to your analytics dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="neon-input w-full px-4 py-3 text-sm"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="neon-input w-full px-4 py-3 text-sm"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-sm font-bold"
            style={{ padding: "0.75rem", fontSize: "0.9rem" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor: "#fff", borderTopColor: "transparent" }}
                />
                Signing in...
              </span>
            ) : "Sign In →"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
            Demo mode — any credentials work
          </p>
          <Link
            to="/"
            className="text-xs font-medium"
            style={{ color: "var(--pink)" }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
