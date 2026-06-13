import React, { useMemo } from "react";

const COUNT = 22;

const DARK_COLORS  = ["#e91e8c", "#00d4ff", "#b300ff", "#00ff88"];
const LIGHT_COLORS = ["#e91e8c", "#7c3aed", "#0ea5e9", "#10b981"];

export default function Particles({ isDark }) {
  const particles = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        left: `${(i / COUNT) * 100 + (Math.random() * 4 - 2)}%`,
        size: Math.random() * 5 + 2,
        duration: `${Math.random() * 22 + 16}s`,
        delay: `-${Math.random() * 30}s`,
      })),
    []
  );

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        pointerEvents: "none", overflow: "hidden",
        zIndex: 0,
      }}
    >
      {particles.map((p) => {
        const color = colors[p.id % colors.length];
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              bottom: "-20px",
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              background: isDark
                ? `radial-gradient(circle, ${color} 0%, transparent 70%)`
                : color,
              opacity: isDark ? 0.75 : 0.35,
              filter: isDark ? "blur(1px) brightness(1.4)" : "blur(0.5px)",
              animation: `floatUp ${p.duration} ${p.delay} infinite linear`,
            }}
          />
        );
      })}
    </div>
  );
}
