// =======================================================
// PoemTextarea.jsx（palette完全対応）
// =======================================================

import React, { useRef, useEffect } from "react";

export default function PoemTextarea({ value, onChange, palette }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [value]);

  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ここに詩を書き始めてください…"
        style={{
          width: "100%",
          padding: "1rem 1.2rem",
          fontSize: "1.05rem",
          fontFamily: "'YuMincho', serif",
          lineHeight: "1.8",
          background: palette.inputBg,
          color: palette.text,
          border: `1px solid ${palette.border}`,
          borderRadius: "12px",
          resize: "none",
          overflow: "hidden",
          outline: "none",
          whiteSpace: "pre-wrap",
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
