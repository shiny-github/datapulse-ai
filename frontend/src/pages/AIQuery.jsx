import React, { useState, useRef, useEffect } from "react";
import { queryData } from "../api";
import { useApp } from "../App";

const SUGGESTED = [
  "What are the top 5 performing categories by revenue?",
  "Which region has the highest average order value?",
  "What percentage of orders were returned?",
  "Show me the distribution of payment methods",
  "What is the average shipping time?",
  "Which products have the highest discount rates?",
];

export default function AIQuery() {
  const { dataset, isDark } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const endRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (question) => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await queryData(q);
      setMessages((m) => [...m, { role: "assistant", ...res.data }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "error", content: e.response?.data?.detail ?? e.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col gap-4 fade-in"
      style={{ height: "calc(100vh - 6rem)" }}
    >
      {!dataset && (
        <div className="card text-sm" style={{ borderColor: "var(--amber)", color: "var(--amber)", background: "rgba(255,183,0,0.06)" }}>
          Upload and run the pipeline first to enable AI queries.
        </div>
      )}

      {/* Message area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="space-y-5">
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🤖</div>
              <h3 className="font-bold text-lg text-gradient mb-1">Ask anything about your data</h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>Powered by Groq LLaMA 3.3 + ChromaDB RAG</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  disabled={!dataset}
                  className="card text-left text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: "var(--muted)" }}
                  onMouseEnter={(e) => { if (dataset) e.currentTarget.style.color = "var(--text)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; }}
                >
                  <span style={{ color: "var(--pink)", marginRight: 6 }}>→</span>{q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" && (
              <div
                className="max-w-xl rounded-2xl px-4 py-3 text-sm"
                style={{
                  background: "linear-gradient(135deg, rgba(233,30,140,0.2), rgba(179,0,255,0.15))",
                  border: "1px solid rgba(233,30,140,0.35)",
                  color: "var(--text)",
                  borderTopRightRadius: 4,
                  boxShadow: "0 0 16px var(--glow-pink)",
                }}
              >
                {msg.content}
              </div>
            )}

            {msg.role === "assistant" && (
              <div className="max-w-2xl space-y-2">
                <div
                  className="card rounded-2xl"
                  style={{ borderColor: "rgba(0,212,255,0.3)", borderTopLeftRadius: 4, boxShadow: "0 0 16px var(--glow-blue)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gradient">🤖 DataPulse AI</span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      · {msg.chunks_used} chunks · {Math.round((msg.confidence ?? 0) * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text)" }}>
                    {msg.answer}
                  </p>
                  {msg.source_rows?.length > 0 && (
                    <details className="mt-3">
                      <summary className="text-xs cursor-pointer" style={{ color: "var(--muted)" }}>
                        View source rows ({msg.source_rows.length})
                      </summary>
                      <div
                        className="mt-2 rounded-lg p-2 font-mono text-xs space-y-1"
                        style={{ background: "#060b14", color: "#a0b0c8" }}
                      >
                        {msg.source_rows.map((r, j) => <div key={j}>{r}</div>)}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            )}

            {msg.role === "error" && (
              <div
                className="card text-sm max-w-lg"
                style={{ borderColor: "var(--red)", color: "var(--red)", background: "rgba(255,77,109,0.06)" }}
              >
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="card flex items-center gap-2 text-sm"
              style={{ borderColor: "rgba(0,212,255,0.3)", color: "var(--muted)" }}
            >
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: "var(--pink)", animationDelay: `${d}ms` }}
                />
              ))}
              Analyzing your data...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder={dataset ? "Ask a question about your data..." : "Upload a dataset first"}
          disabled={!dataset || loading}
          className="flex-1 px-4 py-3 text-sm neon-input"
        />
        <button
          className="btn-primary px-5"
          onClick={() => send(input)}
          disabled={!dataset || loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
