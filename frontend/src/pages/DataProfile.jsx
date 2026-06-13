import React, { useEffect, useState } from "react";
import { getProfile } from "../api";
import { useApp } from "../App";

export default function DataProfile() {
  const { dataset } = useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!dataset) return;
    setLoading(true);
    getProfile()
      .then((r) => setProfile(r.data))
      .catch((e) => setError(e.response?.data?.detail ?? e.message))
      .finally(() => setLoading(false));
  }, [dataset]);

  if (!dataset) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4" style={{ color: "var(--muted)" }}>
      <span className="text-4xl">🔍</span>
      <p>Upload a dataset to view its profile</p>
    </div>
  );
  if (loading) return <Spinner />;
  if (error) return (
    <div className="card text-sm" style={{ borderColor: "var(--red)", color: "var(--red)", background: "rgba(255,77,109,0.06)" }}>
      {error}
    </div>
  );
  if (!profile) return null;

  const scoreColor = profile.quality_score >= 80 ? "var(--green)" : profile.quality_score >= 60 ? "var(--amber)" : "var(--red)";

  return (
    <div className="space-y-5 fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Rows",    value: profile.rows?.toLocaleString(),          icon: "🗂️", color: "var(--pink)"   },
          { label: "Total Columns", value: profile.columns,                          icon: "📋", color: "var(--blue)"   },
          { label: "Missing Cells", value: profile.null_cells?.toLocaleString(),     icon: "⚠️", color: "var(--amber)"  },
          { label: "Duplicate Rows",value: profile.duplicate_rows?.toLocaleString(), icon: "🔁", color: "var(--purple)" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>{label}</div>
            <div className="font-black text-xl mt-0.5" style={{ color, textShadow: `0 0 16px ${color}50` }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Quality score */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-gradient">Data Quality Score</h3>
          <span className="font-black text-2xl" style={{ color: scoreColor, textShadow: `0 0 20px ${scoreColor}60` }}>
            {profile.quality_score}/100
          </span>
        </div>
        <div className="space-y-3">
          {[
            { label: "Completeness", pct: profile.completeness_pct, color: "var(--blue)" },
            { label: "Uniqueness",   pct: profile.uniqueness_pct,   color: "var(--purple)" },
          ].map(({ label, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1" style={{ color: "var(--muted)" }}>
                <span>{label}</span><span>{pct}%</span>
              </div>
              <div className="progress-track h-2">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, var(--pink), ${color})`,
                    boxShadow: `0 0 8px var(--glow-pink)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column stats table */}
      <div className="card overflow-x-auto">
        <h3 className="font-semibold text-sm mb-4 text-gradient-purple">Column Statistics</h3>
        <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr className="text-left" style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
              {["Column","Type","Non-Null","Null %","Unique","Min / Mean / Max","Outliers"].map((h) => (
                <th key={h} className="pb-2 pr-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profile.column_profiles?.map((col, i) => (
              <tr
                key={col.name}
                style={{ borderBottom: "1px solid var(--border)", opacity: 0.95 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(233,30,140,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <td className="py-2 pr-4 font-mono font-semibold" style={{ color: "var(--pink)" }}>{col.name}</td>
                <td className="py-2 pr-4" style={{ color: "var(--muted)" }}>{col.dtype}</td>
                <td className="py-2 pr-4" style={{ color: "var(--text)" }}>{col.non_null?.toLocaleString()}</td>
                <td className="py-2 pr-4">
                  <span style={{ color: col.null_pct > 10 ? "var(--red)" : col.null_pct > 0 ? "var(--amber)" : "var(--green)" }}>
                    {col.null_pct}%
                  </span>
                </td>
                <td className="py-2 pr-4" style={{ color: "var(--muted)" }}>{col.unique?.toLocaleString()}</td>
                <td className="py-2 pr-4 font-mono" style={{ color: "var(--muted)" }}>
                  {col.mean !== undefined
                    ? `${col.min} / ${col.mean} / ${col.max}`
                    : Object.entries(col.top_values ?? {}).slice(0, 2).map(([k]) => k).join(", ")}
                </td>
                <td className="py-2">
                  {col.outliers !== undefined
                    ? <span style={{ color: col.outliers > 0 ? "var(--amber)" : "var(--green)" }}>{col.outliers}</span>
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 rounded-full border-4 animate-spin"
        style={{ borderColor: "var(--purple)", borderTopColor: "var(--pink)" }} />
    </div>
  );
}
