// =======================================================
// EmotionSelect.jsx（palette完全対応）
// =======================================================

import React from "react";

const EMOTIONS = [
  { value: "light", label: "光 / Light" },
  { value: "dark", label: "闇 / Dark" },
  { value: "warm", label: "温 / Warm" },
  { value: "cool", label: "冷 / Cool" },
  { value: "love", label: "愛 / Love" },
  { value: "sorrow", label: "哀 / Sorrow" },
  { value: "growth", label: "芽 / Growth" },
];

export default function EmotionSelect({ value, onChange, palette }) {
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <div
        style={{
          fontFamily: "'YuMincho', serif",
          marginBottom: "0.4rem",
          opacity: 0.85,
        }}
      >
        感情
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {EMOTIONS.map((e) => {
          const selected = value === e.value;

          return (
            <div
              key={e.value}
              onClick={() => onChange(e.value)}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "'YuMincho', serif",
                background: selected
                  ? palette.primary
                  : palette.inputBg,
                color: selected ? "#fff" : palette.text,
                border: `1px solid ${
                  selected ? palette.primary : palette.border
                }`,
                transition: "0.25s ease",
              }}
            >
              {e.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
