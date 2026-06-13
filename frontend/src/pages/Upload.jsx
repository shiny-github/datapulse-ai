import React, { useState, useRef } from "react";
import { uploadFile } from "../api";
import { useApp } from "../App";
import { useNavigate } from "react-router-dom";

const DOMAINS = ["E-Commerce", "Healthcare", "Finance", "Supply Chain", "HR Analytics", "Marketing"];

export default function Upload() {
  const { setDataset } = useApp();
  const navigate = useNavigate();
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);
  const inputRef = useRef();

  const handleFile = async (file) => {
    setError(null); setUploading(true);
    try {
      const res = await uploadFile(file);
      setResult(res.data);
      setDataset(res.data);
    } catch (e) {
      setError(e.response?.data?.detail ?? e.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-in">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current.click()}
        className="card cursor-pointer flex flex-col items-center justify-center py-14 gap-4 transition-all duration-200"
        style={{
          border: `2px dashed ${dragging ? "var(--pink)" : "var(--border)"}`,
          boxShadow: dragging ? "0 0 40px var(--glow-pink), 0 0 80px var(--glow-purple)" : undefined,
          background: dragging ? "rgba(233,30,140,0.05)" : undefined,
        }}
      >
        <input
          ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.json"
          className="hidden"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />
        {uploading ? (
          <>
            <div className="w-12 h-12 rounded-full border-4 animate-spin"
              style={{ borderColor: "var(--purple)", borderTopColor: "var(--pink)" }} />
            <p className="font-semibold" style={{ color: "var(--pink)" }}>Uploading...</p>
          </>
        ) : (
          <>
            <div className="text-5xl">📂</div>
            <div className="text-center">
              <p className="font-bold text-lg" style={{ color: "var(--text)" }}>Drop your file here</p>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>or click to browse</p>
            </div>
            <div className="flex gap-2 mt-1">
              {[".CSV", ".XLSX", ".XLS", ".JSON"].map((f) => (
                <span key={f} className="neon-tag font-mono">{f}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="card text-sm" style={{ borderColor: "var(--red)", color: "var(--red)", background: "rgba(255,77,109,0.06)" }}>
          {error}
        </div>
      )}

      {result && (
        <div className="card fade-in space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl" style={{ color: "var(--green)" }}>✓</span>
            <h3 className="font-bold text-gradient">Upload Successful</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "File",    value: result.filename },
              { label: "Rows",    value: result.rows?.toLocaleString() },
              { label: "Columns", value: result.columns?.length },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-3" style={{ background: "rgba(233,30,140,0.06)", border: "1px solid var(--border)" }}>
                <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>{label}</div>
                <div className="font-semibold text-sm truncate" style={{ color: "var(--text)" }}>{value}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: "var(--muted)" }}>Detected Columns</div>
            <div className="flex flex-wrap gap-1.5">
              {result.columns?.map((c) => (
                <span key={c} className="neon-tag font-mono">{c}</span>
              ))}
            </div>
          </div>
          <button className="btn-primary w-full" onClick={() => navigate("/pipeline")}>
            Run ETL Pipeline →
          </button>
        </div>
      )}

      <div className="card space-y-3">
        <h3 className="font-semibold text-sm text-gradient">Supported Domains</h3>
        <div className="grid grid-cols-3 gap-2">
          {DOMAINS.map((d) => (
            <div
              key={d}
              className="text-center py-2 px-3 rounded-xl text-xs theme-tr"
              style={{ background: "rgba(179,0,255,0.06)", border: "1px solid var(--border)", color: "var(--muted)" }}
            >
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
