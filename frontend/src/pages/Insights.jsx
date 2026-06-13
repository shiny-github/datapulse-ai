import React, { useState } from "react";
import { getInsights } from "../api";
import { useApp } from "../App";

const TYPE_ICONS = {
  trend: "📈", anomaly: "⚡", opportunity: "🚀",
  risk: "⚠️", performance: "🏆", pattern: "🔍",
};

const TYPE_COLOR = {
  trend:       "var(--blue)",
  anomaly:     "var(--amber)",
  opportunity: "var(--green)",
  risk:        "var(--red)",
  performance: "var(--purple)",
  pattern:     "var(--pink)",
};

export default function Insights() {
  const { dataset } = useApp();
  const [insights, setInsights]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getInsights();
      setInsights(res.data.insights ?? []);
      setGenerated(true);
    } catch (e) {
      setError(e.response?.data?.detail ?? e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!dataset) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4" style={{ color: "var(--muted)" }}>
      <span className="text-4xl">💡</span>
      <p>Upload a dataset to generate AI insights</p>
    </div>
  );

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gradient">AI-Generated Insights</h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Powered by Groq LLaMA 3.3 — real patterns from your data
          </p>
        </div>
        <button className="btn-primary" onClick={generate} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "#fff", borderTopColor: "transparent" }} />
              Analyzing...
            </span>
          ) : generated ? "↻  Regenerate" : "✨  Generate Insights"}
        </button>
      </div>

      {error && (
        <div className="card text-sm" style={{ borderColor: "var(--red)", color: "var(--red)", background: "rgba(255,77,109,0.06)" }}>
          {error}
        </div>
      )}

      {!generated && !loading && (
        <div className="card flex flex-col items-center gap-4 py-12">
          <div className="text-5xl">💡</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Click "Generate Insights" to analyze patterns in your data
          </p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse h-36">
              <div className="h-3.5 rounded w-1/2 mb-3" style={{ background: "var(--border)" }} />
              <div className="h-2.5 rounded w-full mb-2" style={{ background: "var(--border)" }} />
              <div className="h-2.5 rounded w-3/4" style={{ background: "var(--border)" }} />
            </div>
          ))}
        </div>
      )}

      {insights.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {insights.map((ins, i) => {
            const c = TYPE_COLOR[ins.type] ?? "var(--pink)";
            return (
              <div
                key={i}
                className="card fade-in"
                style={{
                  borderColor: c,
                  boxShadow: `0 0 20px ${c}30, 0 4px 20px rgba(0,0,0,0.2)`,
                  animationDelay: `${i * 70}ms`,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{TYPE_ICONS[ins.type] ?? "💡"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="font-bold text-sm" style={{ color: "var(--text)" }}>{ins.title}</h4>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-md font-medium capitalize"
                        style={{ background: `${c}18`, color: c, border: `1px solid ${c}40` }}
                      >
                        {ins.type}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--muted)" }}>
                      {ins.description}
                    </p>

                    {/* Confidence bar */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="progress-track flex-1 h-1.5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(ins.confidence ?? 0.8) * 100}%`,
                            background: `linear-gradient(90deg, var(--pink), ${c})`,
                          }}
                        />
                      </div>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        {Math.round((ins.confidence ?? 0.8) * 100)}%
                      </span>
                    </div>

                    {ins.action && (
                      <div
                        className="text-xs rounded-lg px-2 py-1.5"
                        style={{
                          background: `${c}10`,
                          border: `1px solid ${c}30`,
                          color: c,
                        }}
                      >
                        → {ins.action}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
