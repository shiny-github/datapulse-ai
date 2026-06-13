import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../App";
import Particles from "../components/Particles";

const FEATURES = [
  {
    icon: "📊", to: "/dashboard", label: "Dashboard",
    title: "Live Metrics & Charts",
    desc: "Instantly generated KPI cards, bar charts, and pie charts driven entirely by your real uploaded data — no fake numbers.",
    color: "var(--pink)",
  },
  {
    icon: "⬆️", to: "/upload", label: "Upload",
    title: "Any File Format",
    desc: "CSV, Excel, or JSON — drag and drop your dataset and DataPulse AI auto-detects columns, types, and business domain.",
    color: "var(--blue)",
  },
  {
    icon: "⚙️", to: "/pipeline", label: "ETL Pipeline",
    title: "5-Stage Data Pipeline",
    desc: "Ingest → Clean → Transform → Validate → Load. Watch each stage run live with real-time logs and a quality score out of 100.",
    color: "var(--purple)",
  },
  {
    icon: "🤖", to: "/query", label: "AI Query",
    title: "Ask Anything in English",
    desc: "RAG-powered Q&A retrieves the most relevant rows from ChromaDB and feeds them to Groq LLaMA 3.3 for accurate, grounded answers.",
    color: "var(--green)",
  },
  {
    icon: "🔍", to: "/profile", label: "Data Profile",
    title: "Full Statistical Profiling",
    desc: "Per-column breakdown: null counts, outliers, min/mean/max, uniqueness score, and an overall data quality report.",
    color: "var(--amber)",
  },
  {
    icon: "💡", to: "/insights", label: "AI Insights",
    title: "Business Insights on Demand",
    desc: "LLaMA 3.3 scans your actual dataset and generates 6 typed insights — trends, anomalies, risks, and opportunities — with confidence scores.",
    color: "var(--pink)",
  },
];

const COMPARISON_ROWS = [
  ["Runs a real ETL pipeline on your file",      false, true ],
  ["Answers from YOUR data, not training data",   false, true ],
  ["Generates visual charts from real rows",      false, true ],
  ["Data quality scoring 0–100",                  false, true ],
  ["Detects your business domain automatically",  false, true ],
  ["Cloud storage via Azure Blob",                false, true ],
  ["REST API + Swagger docs included",            false, true ],
  ["Per-column statistical profiling",            false, true ],
];

const DOMAINS = [
  { icon: "🏥", label: "Healthcare",   desc: "Patient records, drug trials, clinical outcomes", color: "var(--blue)"   },
  { icon: "💰", label: "Finance",      desc: "Transactions, risk models, portfolio analysis",   color: "var(--green)"  },
  { icon: "🛒", label: "E-Commerce",   desc: "Orders, returns, revenue, conversion funnels",   color: "var(--pink)"   },
  { icon: "🚚", label: "Supply Chain", desc: "Inventory, shipping, supplier performance",       color: "var(--purple)" },
  { icon: "👥", label: "HR Analytics", desc: "Headcount, attrition, performance reviews",      color: "var(--amber)"  },
  { icon: "📣", label: "Marketing",    desc: "Campaigns, attribution, CAC, LTV metrics",       color: "var(--pink)"   },
];

const STACK = [
  { label: "FastAPI",   color: "var(--green)"  },
  { label: "React 18",  color: "var(--blue)"   },
  { label: "ChromaDB",  color: "var(--purple)" },
  { label: "Groq AI",   color: "var(--pink)"   },
  { label: "RAG",       color: "var(--amber)"  },
  { label: "Azure",     color: "var(--blue)"   },
  { label: "Python",    color: "var(--green)"  },
  { label: "Vite",      color: "var(--purple)" },
];

const STATS = [
  { value: "5 min",  label: "from upload to insights" },
  { value: "5-stage", label: "automated ETL pipeline"  },
  { value: "RAG",    label: "grounded AI answers"      },
  { value: "100pt",  label: "data quality scoring"     },
];

export default function Home() {
  const { isDark, toggleTheme } = useApp();
  const howRef      = useRef(null);
  const featuresRef = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", overflowX: "hidden" }}
    >
      <div className="app-bg" />
      <Particles isDark={isDark} />

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: isDark ? "rgba(13,13,26,0.88)" : "rgba(240,240,255,0.88)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ maxWidth: 1100, margin: "0 auto" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center font-black text-sm rounded-xl flex-shrink-0"
              style={{
                width: 36, height: 36,
                background: "linear-gradient(135deg, var(--pink), var(--purple))",
                color: "#fff",
                boxShadow: "0 0 20px var(--glow-pink)",
              }}
            >
              DP
            </div>
            <span className="font-black text-base text-gradient">DataPulse AI</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              style={{
                width: 34, height: 34, borderRadius: 10, cursor: "pointer",
                background: "rgba(233,30,140,0.1)", border: "1px solid rgba(233,30,140,0.25)",
                color: "var(--pink)", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            <Link
              to="/login"
              className="btn-primary"
              style={{ fontSize: "0.82rem", padding: "0.45rem 1.1rem", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
            >
              Login →
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section
          className="flex flex-col items-center justify-center text-center px-6 fade-in"
          style={{ minHeight: "92vh", paddingTop: "4rem", paddingBottom: "5rem" }}
        >
          {/* Badge */}
          <div
            className="neon-tag mb-7"
            style={{ fontSize: "0.72rem", letterSpacing: "0.06em" }}
          >
            ✦ Powered by Groq · ChromaDB · Azure · RAG
          </div>

          {/* Headline */}
          <h1
            className="font-black text-gradient leading-none mb-6"
            style={{
              fontSize: "clamp(2.4rem, 7.5vw, 5.2rem)",
              maxWidth: 860,
              lineHeight: 1.07,
            }}
          >
            Turn Any Dataset Into an<br />AI-Powered Analytics Product
          </h1>

          {/* Subtext */}
          <p
            className="mb-8 max-w-2xl leading-relaxed"
            style={{
              color: "var(--muted)",
              fontSize: "clamp(0.95rem, 2.2vw, 1.15rem)",
              maxWidth: 640,
            }}
          >
            Upload your data. Run the pipeline. Ask AI anything.<br />
            <strong style={{ color: "var(--pink)" }}>Get insights in minutes — not days.</strong>
          </p>

          {/* CTA buttons */}
          <div className="flex items-center gap-4 flex-wrap justify-center mb-14">
            <Link
              to="/login"
              className="btn-primary"
              style={{
                fontSize: "1rem", padding: "0.85rem 2.2rem",
                textDecoration: "none", display: "inline-flex", alignItems: "center",
                boxShadow: "0 0 40px var(--glow-pink), 0 0 80px var(--glow-purple)",
              }}
            >
              Get Started Free →
            </Link>
            <button
              onClick={() => scrollTo(featuresRef)}
              style={{
                fontSize: "0.95rem", padding: "0.85rem 2rem",
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--text)", borderRadius: 14, cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--pink)"; e.currentTarget.style.color = "var(--pink)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}
            >
              See How It Works ↓
            </button>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3 justify-center">
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="text-center px-5 py-3 rounded-2xl"
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                  border: "1px solid var(--border)",
                  minWidth: 120,
                }}
              >
                <div className="font-black text-lg text-gradient">{value}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHAT IS DATAPULSE ────────────────────────────────────────────── */}
        <section ref={howRef} style={{ padding: "5rem 1.5rem", background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.015)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="text-center mb-12">
              <div className="neon-tag mb-4" style={{ fontSize: "0.7rem" }}>THE BIG PICTURE</div>
              <h2 className="font-black text-gradient" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
                What is DataPulse AI?
              </h2>
            </div>

            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
            >
              {[
                {
                  icon: "😩", label: "The Problem", color: "var(--red)",
                  heading: "80% wasted on prep",
                  body: "Data analysts spend the majority of their time cleaning, transforming, and manually preparing data — before any real analysis even begins.",
                },
                {
                  icon: "⚡", label: "The Solution", color: "var(--pink)",
                  heading: "AI automates everything",
                  body: "DataPulse AI runs a full 5-stage ETL pipeline automatically, then lets you query your cleaned data in plain English using RAG-powered AI.",
                },
                {
                  icon: "🚀", label: "The Result", color: "var(--green)",
                  heading: "Insights in under 5 min",
                  body: "Upload any dataset and get clean data, live charts, a full statistical profile, and AI-generated business insights — all in under five minutes.",
                },
              ].map(({ icon, label, color, heading, body }) => (
                <div
                  key={label}
                  className="card fade-in"
                  style={{ borderColor: `${color}35`, boxShadow: `0 0 30px ${color}15` }}
                >
                  <div
                    className="text-2xl flex items-center justify-center rounded-xl mb-4"
                    style={{ width: 52, height: 52, background: `${color}15`, border: `1px solid ${color}30` }}
                  >
                    {icon}
                  </div>
                  <div className="text-xs font-bold mb-2" style={{ color, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {label}
                  </div>
                  <h3 className="font-black text-lg mb-3" style={{ color: "var(--text)", lineHeight: 1.2 }}>{heading}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section ref={featuresRef} style={{ padding: "5rem 1.5rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="text-center mb-12">
              <div className="neon-tag mb-4" style={{ fontSize: "0.7rem" }}>SIX INTEGRATED MODULES</div>
              <h2 className="font-black text-gradient-purple" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
                Everything you need to go from raw data to real answers
              </h2>
              <p className="text-sm mt-3 max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
                Each module maps to a page in the app — they all talk to each other.
              </p>
            </div>

            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
            >
              {FEATURES.map(({ icon, label, title, desc, color }, i) => (
                <div
                  key={label}
                  className="card fade-in group"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    borderColor: `${color}25`,
                    transition: "all 0.25s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${color}60`;
                    e.currentTarget.style.boxShadow = `0 0 30px ${color}25, 0 8px 30px rgba(0,0,0,0.2)`;
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${color}25`;
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.transform = "";
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="text-2xl flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{ width: 48, height: 48, background: `${color}12`, border: `1px solid ${color}25` }}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold mb-1" style={{ color, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                        {label}
                      </div>
                      <h3 className="font-bold text-base mb-2" style={{ color: "var(--text)" }}>{title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPARISON ───────────────────────────────────────────────────── */}
        <section
          style={{
            padding: "5rem 1.5rem",
            background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.015)",
            borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div className="text-center mb-12">
              <div className="neon-tag mb-4" style={{ fontSize: "0.7rem" }}>WHY NOT JUST USE CHATGPT?</div>
              <h2 className="font-black text-gradient" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
                ChatGPT talks about data.<br />DataPulse AI <em>processes</em> it.
              </h2>
            </div>

            <div className="card overflow-x-auto" style={{ padding: 0 }}>
              <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 520 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th
                      className="text-left text-xs font-semibold px-6 py-4"
                      style={{ color: "var(--muted)", width: "54%" }}
                    >
                      CAPABILITY
                    </th>
                    <th
                      className="text-center text-xs font-semibold px-4 py-4"
                      style={{ color: "var(--muted)", width: "23%" }}
                    >
                      Generic AI
                    </th>
                    <th
                      className="text-center text-xs font-bold px-4 py-4"
                      style={{ color: "var(--pink)", width: "23%" }}
                    >
                      DataPulse AI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map(([feature, generic, dp], i) => (
                    <tr
                      key={feature}
                      style={{ borderBottom: i < COMPARISON_ROWS.length - 1 ? "1px solid var(--border)" : "none" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td className="text-sm px-6 py-4" style={{ color: "var(--text)" }}>{feature}</td>
                      <td className="text-center text-lg px-4 py-4">{generic ? "✅" : "❌"}</td>
                      <td className="text-center text-lg px-4 py-4">{dp ? "✅" : "❌"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── DOMAINS ──────────────────────────────────────────────────────── */}
        <section style={{ padding: "5rem 1.5rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="text-center mb-12">
              <div className="neon-tag mb-4" style={{ fontSize: "0.7rem" }}>WORKS FOR ANY INDUSTRY</div>
              <h2 className="font-black text-gradient-purple" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
                Auto-detects your business domain
              </h2>
              <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "var(--muted)" }}>
                Drop in your dataset — DataPulse AI reads your column names and automatically identifies your industry.
              </p>
            </div>

            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
            >
              {DOMAINS.map(({ icon, label, desc, color }) => (
                <div
                  key={label}
                  className="card flex items-center gap-4 fade-in"
                  style={{
                    borderColor: `${color}30`,
                    transition: "all 0.22s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${color}70`;
                    e.currentTarget.style.boxShadow = `0 0 24px ${color}20`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${color}30`;
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.transform = "";
                  }}
                >
                  <div
                    className="text-2xl flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{ width: 50, height: 50, background: `${color}12`, border: `1px solid ${color}30` }}
                  >
                    {icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm mb-1" style={{ color }}>{label}</div>
                    <div className="text-xs leading-snug" style={{ color: "var(--muted)" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECH STACK ───────────────────────────────────────────────────── */}
        <section
          style={{
            padding: "4rem 1.5rem",
            borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
            background: isDark ? "rgba(255,255,255,0.012)" : "rgba(0,0,0,0.012)",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <p className="text-xs font-bold mb-6" style={{ color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Built with production-ready technologies
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {STACK.map(({ label, color }) => (
                <span
                  key={label}
                  className="font-bold text-sm px-5 py-2.5 rounded-xl"
                  style={{
                    background: `${color}10`,
                    border: `1px solid ${color}35`,
                    color,
                    boxShadow: `0 0 12px ${color}18`,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 22px ${color}45`; e.currentTarget.style.transform = "scale(1.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 12px ${color}18`; e.currentTarget.style.transform = ""; }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER CTA ───────────────────────────────────────────────────── */}
        <section
          className="text-center"
          style={{
            padding: "6rem 1.5rem",
            background: isDark
              ? "linear-gradient(135deg, rgba(233,30,140,0.07) 0%, rgba(179,0,255,0.07) 50%, rgba(0,212,255,0.05) 100%)"
              : "linear-gradient(135deg, rgba(233,30,140,0.05) 0%, rgba(124,58,237,0.05) 50%, rgba(14,165,233,0.05) 100%)",
          }}
        >
          <div className="neon-tag mb-6" style={{ fontSize: "0.7rem" }}>NO SETUP · NO ACCOUNT REQUIRED · DEMO MODE</div>
          <h2
            className="font-black text-gradient mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
          >
            Ready to analyze your data?
          </h2>
          <p
            className="mb-10 max-w-md mx-auto"
            style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.7 }}
          >
            Upload any CSV, Excel, or JSON file and get AI-powered insights, live charts, and a full data profile — all in under five minutes.
          </p>
          <Link
            to="/login"
            className="btn-primary"
            style={{
              fontSize: "1.1rem", padding: "1rem 3rem",
              textDecoration: "none", display: "inline-flex", alignItems: "center",
              boxShadow: "0 0 50px var(--glow-pink), 0 0 100px var(--glow-purple), 0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            Get Started Free →
          </Link>
          <p className="mt-6 text-xs" style={{ color: "var(--muted)" }}>
            Any credentials work in demo mode · Built with ♥ for hackathons
          </p>
        </section>

        {/* ── SITE FOOTER ──────────────────────────────────────────────────── */}
        <footer
          className="flex items-center justify-between px-8 py-5 flex-wrap gap-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center font-black text-xs rounded-lg"
              style={{
                width: 26, height: 26,
                background: "linear-gradient(135deg, var(--pink), var(--purple))",
                color: "#fff",
              }}
            >
              DP
            </div>
            <span className="text-xs font-bold text-gradient">DataPulse AI</span>
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            FastAPI · React · ChromaDB · Groq · Azure
          </p>
          <Link
            to="/login"
            className="text-xs font-semibold"
            style={{ color: "var(--pink)", textDecoration: "none" }}
          >
            Sign In →
          </Link>
        </footer>
      </div>
    </div>
  );
}
