import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { runPipeline, getPipelineStatus } from "../api";
import { useApp } from "../App";

const STAGE_ICONS = ["📥", "🧹", "⚙️", "✅", "💾"];

const STATUS_STYLE = {
  idle:      { color: "var(--muted)",   border: "var(--border)",              bg: "transparent" },
  running:   { color: "var(--amber)",   border: "rgba(255,183,0,0.5)",        bg: "rgba(255,183,0,0.06)" },
  completed: { color: "var(--green)",   border: "rgba(0,255,136,0.5)",        bg: "rgba(0,255,136,0.06)" },
  error:     { color: "var(--red)",     border: "rgba(255,77,109,0.5)",       bg: "rgba(255,77,109,0.06)" },
};

function defaultStages() {
  return [
    { id:1, name:"Ingest",    status:"idle", log:[] },
    { id:2, name:"Clean",     status:"idle", log:[] },
    { id:3, name:"Transform", status:"idle", log:[] },
    { id:4, name:"Validate",  status:"idle", log:[] },
    { id:5, name:"Load",      status:"idle", log:[] },
  ];
}

export default function Pipeline() {
  const { dataset } = useApp();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);
  const pollRef = useRef(null);
  const logRef  = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await getPipelineStatus();
      setStatus(res.data);
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
      if (!res.data.running && started) { clearInterval(pollRef.current); setRunning(false); }
    } catch {}
  };

  const handleRun = async () => {
    setError(null); setRunning(true); setStarted(true);
    try {
      await runPipeline();
      pollRef.current = setInterval(fetchStatus, 1000);
    } catch (e) {
      setError(e.response?.data?.detail ?? e.message);
      setRunning(false);
    }
  };

  useEffect(() => {
    if (dataset) fetchStatus();
    return () => clearInterval(pollRef.current);
  }, []);

  if (!dataset) return (
    <div className="flex flex-col items-center justify-center h-full gap-6 fade-in">
      <div className="text-6xl">⚙️</div>
      <div className="text-center">
        <h2 className="font-bold text-xl mb-2" style={{ color: "var(--text)" }}>No Dataset Loaded</h2>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Upload a file first, then run the 5-stage ETL pipeline</p>
        <button className="btn-primary" onClick={() => navigate("/upload")}>Upload Dataset</button>
      </div>
    </div>
  );

  const allLogs = status?.stages?.flatMap((s) => s.log.map((l) => ({ stage: s.name, msg: l }))) ?? [];
  const stages  = status?.stages ?? defaultStages();

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gradient">ETL Pipeline</h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>5-stage enterprise data processing</p>
        </div>
        <button className="btn-primary" onClick={handleRun} disabled={running}>
          {running ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "#fff", borderTopColor: "transparent" }} />
              Running...
            </span>
          ) : "▶  Run Pipeline"}
        </button>
      </div>

      {error && (
        <div className="card text-sm" style={{ borderColor: "var(--red)", color: "var(--red)", background: "rgba(255,77,109,0.06)" }}>
          {error}
        </div>
      )}

      {status?.quality_score != null && (
        <div className="card flex items-center gap-5" style={{ borderColor: "rgba(0,255,136,0.4)", boxShadow: "0 0 24px rgba(0,255,136,0.15)" }}>
          <span className="text-3xl">🏆</span>
          <div>
            <div className="text-xs mb-0.5" style={{ color: "var(--muted)" }}>Data Quality Score</div>
            <div className="text-3xl font-black" style={{ color: "var(--green)", textShadow: "0 0 20px var(--glow-green,#00ff8840)" }}>
              {status.quality_score}
              <span className="text-lg font-normal" style={{ color: "var(--muted)" }}>/100</span>
            </div>
          </div>
          <div className="flex-1 ml-2">
            <div className="progress-track h-3">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${status.quality_score}%`,
                  background: "linear-gradient(90deg, var(--pink), var(--purple), var(--blue))",
                  boxShadow: "0 0 12px var(--glow-pink)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stage cards */}
      <div className="grid grid-cols-5 gap-3">
        {stages.map((stage, i) => {
          const st = STATUS_STYLE[stage.status] ?? STATUS_STYLE.idle;
          return (
            <div
              key={stage.id ?? i}
              className="card text-center transition-all duration-300"
              style={{ borderColor: st.border, background: st.bg, boxShadow: `0 0 16px ${st.border}` }}
            >
              <div className="text-2xl mb-2">{STAGE_ICONS[i]}</div>
              <div className="text-xs font-semibold" style={{ color: "var(--text)" }}>{stage.name}</div>
              <div className="text-xs mt-1 font-medium" style={{ color: st.color }}>
                {stage.status === "running"   && <span className="animate-pulse">● Running</span>}
                {stage.status === "completed" && "✓ Done"}
                {stage.status === "idle"      && "○ Idle"}
                {stage.status === "error"     && "✗ Error"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Logs */}
      {allLogs.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-sm mb-3 text-gradient-purple">Pipeline Logs</h3>
          <div
            ref={logRef}
            className="rounded-xl p-4 font-mono text-xs space-y-1 max-h-60 overflow-y-auto"
            style={{ background: "#060b14", border: "1px solid rgba(179,0,255,0.15)" }}
          >
            {allLogs.map((entry, i) => (
              <div key={i} className="flex gap-3">
                <span style={{ color: "var(--pink)", flexShrink: 0 }}>[{entry.stage}]</span>
                <span style={{ color: "#a0b0c8" }}>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
