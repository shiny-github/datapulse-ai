import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { getProfile, getDomains, getInsights } from "../api";
import { useApp } from "../App";
import { useNavigate } from "react-router-dom";

const DARK_COLORS  = ["#e91e8c","#00d4ff","#b300ff","#00ff88","#ff6b35","#ffd700","#ff00d4","#00ffcc"];
const LIGHT_COLORS = ["#e91e8c","#0ea5e9","#7c3aed","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];

const INSIGHT_BORDER = {
  trend: "var(--blue)", anomaly: "var(--amber)", opportunity: "var(--green)",
  risk: "var(--red)", performance: "var(--purple)", pattern: "var(--pink)",
};
const INSIGHT_ICON = {
  trend:"📈", anomaly:"⚡", opportunity:"🚀", risk:"⚠️", performance:"🏆", pattern:"🔍",
};

export default function Dashboard() {
  const { dataset, setDataset, isDark } = useApp();
  const navigate = useNavigate();
  const [profile, setProfile]   = useState(null);
  const [domains, setDomains]   = useState(null);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [noData, setNoData]     = useState(false);
  const [error, setError]       = useState(null);

  const COLORS      = isDark ? DARK_COLORS : LIGHT_COLORS;
  const GRID_COLOR  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const TICK_COLOR  = isDark ? "#8892b0" : "#64748b";
  const TOOLTIP_STYLE = {
    background: isDark ? "#111827" : "#ffffff",
    border: `1px solid rgba(233,30,140,0.3)`,
    borderRadius: 10, fontSize: 12,
    color: isDark ? "#fff" : "#0f0f1a",
  };

  const fetchMain = () => {
    setLoading(true); setNoData(false); setError(null);
    Promise.all([getProfile(), getDomains()])
      .then(([p, d]) => {
        setProfile(p.data); setDomains(d.data);
      })
      .catch((e) => {
        if (e.response?.status === 400) setNoData(true);
        else setError("Cannot reach backend at https://datapulse-ai-1t5i.onrender.com");
      })
      .finally(() => setLoading(false));
  };

  const fetchInsights = () => {
    setInsightsLoading(true);
    getInsights()
      .then((r) => setInsights(r.data?.insights ?? []))
      .catch(() => {})
      .finally(() => setInsightsLoading(false));
  };

  useEffect(() => {
    if (!dataset) return;
    fetchMain();
  }, [dataset?.filename]);
  useEffect(() => { if (profile) fetchInsights(); }, [profile]);

  if (!dataset) return (
    <div className="flex flex-col items-center justify-center h-full gap-6 fade-in">
      <div className="text-6xl">📊</div>
      <div className="text-center">
        <h2 className="font-bold text-xl mb-2" style={{ color: "var(--text)" }}>No Dataset Loaded</h2>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Upload a CSV, Excel, or JSON file to get started</p>
        <button className="btn-primary" onClick={() => navigate("/upload")}>Upload Dataset</button>
      </div>
    </div>
  );
  if (loading) return <Spinner />;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 fade-in">
      <span className="text-4xl">⚠️</span>
      <p style={{ color: "var(--red)" }} className="text-sm">{error}</p>
      <button className="btn-primary" onClick={fetchMain}>Retry</button>
    </div>
  );

  if (noData) return (
    <div className="flex flex-col items-center justify-center h-full gap-6 fade-in">
      <div className="text-6xl">📊</div>
      <div className="text-center">
        <h2 className="font-bold text-xl mb-2" style={{ color: "var(--text)" }}>No Dataset Loaded</h2>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Upload a CSV, Excel, or JSON file to get started</p>
        <button className="btn-primary" onClick={() => navigate("/upload")}>Upload Dataset</button>
      </div>
    </div>
  );

  const numCols = profile?.column_profiles?.filter((c) => c.mean !== undefined) ?? [];
  const catCols = profile?.column_profiles?.filter((c) => c.top_values) ?? [];

  const barData = numCols.slice(0, 8).map((c) => ({
    name: c.name.replace(/_/g, " ").slice(0, 13),
    mean: parseFloat((c.mean ?? 0).toFixed(2)),
  }));
  const pieData = catCols[0]
    ? Object.entries(catCols[0].top_values ?? {}).slice(0, 8).map(([name, value]) => ({ name, value }))
    : [];
  const cat2Data = catCols[1]
    ? Object.entries(catCols[1].top_values ?? {}).slice(0, 10).map(([name, value]) => ({ name, value }))
    : [];

  const kpis = [
    { label: "Total Rows",     value: profile?.rows?.toLocaleString() ?? "-",         color: "var(--pink)",   icon: "🗂️" },
    { label: "Columns",        value: profile?.columns ?? "-",                         color: "var(--blue)",   icon: "📋" },
    { label: "Quality Score",  value: profile ? `${profile.quality_score}/100` : "-",  color: "var(--green)",  icon: "✅" },
    { label: "Missing Values", value: profile?.null_cells?.toLocaleString() ?? "-",    color: "var(--amber)",  icon: "⚠️" },
  ];

  return (
    <div className="space-y-5 fade-in">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(({ label, value, color, icon }) => (
          <div key={label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>{label}</div>
                <div className="text-2xl font-black" style={{ color, textShadow: `0 0 20px ${color}60` }}>{value}</div>
              </div>
              <span className="text-2xl">{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Domain banner */}
      {domains && (
        <div className="card flex items-center gap-4">
          <span className="text-2xl">🏢</span>
          <div className="flex-1">
            <div className="text-xs mb-0.5" style={{ color: "var(--muted)" }}>Primary Domain</div>
            <div className="font-bold text-gradient">{domains.primary_domain}</div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {Object.entries(domains.scores).filter(([,v]) => v > 0).slice(0, 4).map(([d, v]) => (
              <span key={d} className="neon-tag">{d}: {v}%</span>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5">
        {barData.length > 0 && (
          <div className="card">
            <h3 className="font-semibold mb-4 text-sm text-gradient-purple">Numeric Column Means</h3>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="name" tick={{ fill: TICK_COLOR, fontSize: 11 }} />
                <YAxis tick={{ fill: TICK_COLOR, fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="mean" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {pieData.length > 0 && (
          <div className="card">
            <h3 className="font-semibold mb-4 text-sm text-gradient-purple">
              Top: <span style={{ color: "var(--pink)" }}>{catCols[0]?.name}</span>
            </h3>
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={pieData} cx="50%" cy="50%" outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name.slice(0, 8)} ${(percent*100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {cat2Data.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4 text-sm text-gradient-purple">
            Distribution: <span style={{ color: "var(--blue)" }}>{catCols[1]?.name}</span>
          </h3>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={cat2Data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="name" tick={{ fill: TICK_COLOR, fontSize: 11 }} />
              <YAxis tick={{ fill: TICK_COLOR, fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="var(--blue)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Insights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-gradient">AI Insights</h3>
          {insightsLoading && (
            <span className="text-xs flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
              <span className="w-3 h-3 rounded-full border-2 animate-spin" style={{ borderColor: "var(--pink)", borderTopColor: "transparent" }} />
              Generating...
            </span>
          )}
        </div>
        {insightsLoading && insights.length === 0 && (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse h-24">
                <div className="h-3 rounded w-1/2 mb-3" style={{ background: "var(--border)" }} />
                <div className="h-2.5 rounded w-full mb-2" style={{ background: "var(--border)" }} />
                <div className="h-2.5 rounded w-3/4" style={{ background: "var(--border)" }} />
              </div>
            ))}
          </div>
        )}
        {insights.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {insights.slice(0, 4).map((ins, i) => {
              const c = INSIGHT_BORDER[ins.type] ?? "var(--pink)";
              return (
                <div
                  key={i}
                  className="card fade-in"
                  style={{ borderColor: c, boxShadow: `0 0 16px ${c}30`, animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex gap-3">
                    <span className="text-xl flex-shrink-0">{INSIGHT_ICON[ins.type] ?? "💡"}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm mb-1 truncate" style={{ color: "var(--text)" }}>{ins.title}</div>
                      <div className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--muted)" }}>{ins.description}</div>
                      {ins.action && (
                        <div className="mt-2 text-xs" style={{ color: "var(--pink)" }}>→ {ins.action}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-4 animate-spin"
        style={{ borderColor: "var(--purple)", borderTopColor: "var(--pink)" }} />
    </div>
  );
}
