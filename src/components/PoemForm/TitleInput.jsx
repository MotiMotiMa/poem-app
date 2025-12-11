// =======================================================
// TitleInput.jsx（palette完全対応）
// =======================================================

import React from "react";

export default function TitleInput({ value, onChange, palette }) {
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="（タイトル）"
        style={{
          width: "100%",
          padding: "0.7rem 1rem",
          fontSize: "1.2rem",
          fontWeight: "600",
          fontFamily: "'YuMincho', serif",
          letterSpacing: "0.05em",
          background: palette.inputBg,
          color: palette.text,
          border: `1px solid ${palette.border}`,
          borderRadius: "10px",
          outline: "none",
          transition: "0.25s ease",
        }}
        onFocus={(e) => {
          e.target.style.border = `1px solid ${palette.primary}`;
          e.target.style.boxShadow = `0 0 0 3px ${palette.focusShadow}`;
        }}
        onBlur={(e) => {
          e.target.style.border = `1px solid ${palette.border}`;
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}
