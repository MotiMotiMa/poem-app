// =======================================================
// TitleSuggestions.jsx
// 仮タイトル候補リスト（確定フェード演出）
// =======================================================

import React, { useState } from "react";

export default function TitleSuggestions({
  titles = [],
  onSelect,
  onClose,
  palette,
}) {
  const [selected, setSelected] = useState(null);

  if (!titles.length) return null;

  const handleSelect = (t) => {
    setSelected(t);
    // フェード完了後に確定
    setTimeout(() => {
      onSelect(t);
    }, 220);
  };

  return (
    <div
      style={{
        marginBottom: "1.2rem",
        padding: "0.8rem",
        borderRadius: "14px",
        background: palette.bg2,
        border: `1px solid ${palette.border}`,
        transition: "opacity 0.25s ease",
      }}
    >
      <div
        style={{
          fontSize: "0.85rem",
          opacity: 0.6,
          marginBottom: "0.5rem",
        }}
      >
        仮タイトル候補
      </div>

      {titles.map((t, i) => {
        const isChosen = selected === t;
        const isFaded = selected && !isChosen;

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleSelect(t)}
            disabled={!!selected}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "0.6rem 0.8rem",
              marginBottom: "0.4rem",
              borderRadius: "10px",
              background: isChosen ? palette.bg : "none",
              border: `1px dashed ${palette.border}`,
              color: palette.text,
              fontFamily: "'YuMincho', serif",
              cursor: selected ? "default" : "pointer",

              opacity: isFaded ? 0 : 1,
              transform: isChosen ? "scale(0.98)" : "none",
              transition: "opacity 0.2s ease, transform 0.2s ease",
            }}
          >
            {t}
          </button>
        );
      })}

      {!selected && (
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: "0.4rem",
            background: "none",
            border: "none",
            color: palette.text,
            opacity: 0.5,
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          閉じる
        </button>
      )}
    </div>
  );
}
