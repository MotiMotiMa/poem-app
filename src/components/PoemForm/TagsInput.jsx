// =======================================================
// TagsInput.jsx（palette完全対応）
// =======================================================

import React from "react";

export default function TagsInput({ value, onChange, palette }) {
  const tagList = value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const removeTag = (tag) => {
    const newTags = tagList.filter((t) => t !== tag);
    onChange(newTags.join(", "));
  };

  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <label
        style={{
          fontWeight: "bold",
          marginBottom: "0.4rem",
          display: "block",
        }}
      >
        タグ（カンマ区切り）
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例：恋愛, 夜, 記憶"
        style={{
          width: "100%",
          padding: "0.6rem",
          borderRadius: "8px",
          border: `1px solid ${palette.border}`,
          background: palette.inputBg,
          color: palette.text,
          fontSize: "0.95rem",
          marginBottom: "0.8rem",
        }}
      />

      {/* タグPill表示 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {tagList.map((tag, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0.3rem 0.6rem",
              borderRadius: "20px",
              background: palette.tagBg,
              border: `1px solid ${palette.tagBorder}`,
              color: palette.text,
              fontSize: "0.8rem",
            }}
          >
            #{tag}
            <button
              onClick={() => removeTag(tag)}
              style={{
                marginLeft: "0.4rem",
                background: "transparent",
                border: "none",
                color: palette.text,
                cursor: "pointer",
                opacity: 0.8,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
