// =======================================================
// TagPill.jsx（theme-safe × hover-safe / 最終安定版）
// =======================================================

import { useState } from "react";

export default function TagPill({ label, theme, onClick }) {
  // -------------------------------
  // theme 安全化（undefined → light）
  // -------------------------------
  const safeTheme = theme || "light";
  const isDark = safeTheme === "dark";

  // -------------------------------
  // palette（アプリ統一版）
  // -------------------------------
  const colors = {
    tagBg: isDark ? "#3b3b3b" : "#ffffff",
    tagBorder: isDark ? "#555" : "#ccc",
    text: isDark ? "#f1f1f1" : "#222",
    hoverBg: isDark ? "#505050" : "#f0f0f0",
  };

  // hover 安定用
  const [hover, setHover] = useState(false);

  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "0.25rem 0.6rem",
        fontSize: "0.8rem",
        borderRadius: "6px",
        background: hover ? colors.hoverBg : colors.tagBg,
        border: `1px solid ${colors.tagBorder}`,
        color: colors.text,
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >
      #{label}
    </span>
  );
}
