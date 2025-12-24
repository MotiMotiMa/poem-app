// =======================================================
// TitleInput.jsx（仮タイトル対応・安定版）
// =======================================================

import React from "react";

export default function TitleInput({
  value,
  onChange,
  placeholder = "タイトル",
  isSuggested,
  palette,
}) {
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "0.7rem 1rem",
          fontSize: "1.15rem",
          fontFamily: "'YuMincho', serif",
          letterSpacing: "0.04em",
          background: palette.inputBg,
          color: palette.text,
          border: `1px dashed ${
            isSuggested ? palette.primary : palette.border
          }`,
          borderRadius: "10px",
          outline: "none",
          opacity: isSuggested ? 0.75 : 1,
          transition: "0.25s ease",
        }}
        onFocus={(e) => {
          e.target.style.border = `1px solid ${palette.primary}`;
          e.target.style.opacity = 1;
        }}
        onBlur={(e) => {
          e.target.style.border = `1px dashed ${
            isSuggested ? palette.primary : palette.border
          }`;
        }}
      />
    </div>
  );
}
