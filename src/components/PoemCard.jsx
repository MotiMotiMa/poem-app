// ========================================================
// PoemCard.jsx（最終安定版）
// - 表示専用
// - owner 判定は外部で完結
// ========================================================

import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import TagPill from "./TagPill";

export default function PoemCard({
  poem,
  onEdit,     // 自分の詩のときだけ渡される
  onDelete,   // 自分の詩のときだけ渡される
  onTagClick,
  onRead,
  theme,
}) {
  const safeTheme = theme || "light";
  const isDark = safeTheme === "dark";

  const emotionBg = {
    warm: isDark
      ? "linear-gradient(145deg, #4e3b32, #814e33)"
      : "linear-gradient(145deg, #ffe0c2, #ffb68a)",
    cool: isDark
      ? "linear-gradient(145deg, #3b4248, #556067)"
      : "linear-gradient(145deg, #dfe7ee, #c7d4df)",
    dark: isDark
      ? "linear-gradient(145deg, #1a1f24, #2c343a)"
      : "linear-gradient(145deg, #2c3e50, #4ca1af)",
    light: isDark
      ? "linear-gradient(145deg, #3c3c3c, #5a5a5a)"
      : "linear-gradient(145deg, #ffffff, #f1f1f1)",
    love: isDark
      ? "linear-gradient(145deg, #5b2e3c, #7c3a4d)"
      : "linear-gradient(145deg, #ffd0d6, #ff9aae)",
    sorrow: isDark
      ? "linear-gradient(145deg, #2f4962, #3b5b77)"
      : "linear-gradient(145deg, #bcd2f5, #d9e6fa)",
    growth: isDark
      ? "linear-gradient(145deg, #32462b, #4e6b43)"
      : "linear-gradient(145deg, #e2f8c2, #c8f0a1)",
  };

  const bg = emotionBg[poem.emotion] || emotionBg.light;

  const colors = {
    text: isDark ? "#f1f1f1" : "#222",
    readBg: isDark ? "#7cc2ff" : "#2980b9",
    editBg: isDark ? "#555" : "#e0e0e0",
    deleteBg: isDark ? "#a04444" : "#ff6b6b",
  };

  const previewText = poem.poem
    ? poem.poem.split("\n").slice(0, 2).join("\n") +
      (poem.poem.split("\n").length > 2 ? " …" : "")
    : "";

  return (
    <div
      style={{
        position: "relative",
        width: "280px",
        minHeight: "340px",
        borderRadius: "16px",
        padding: "1rem",
        color: colors.text,
        fontFamily: "'YuMincho', serif",
        background: bg,
        boxShadow: isDark
          ? "0 4px 18px rgba(0,0,0,0.55)"
          : "0 4px 14px rgba(0,0,0,0.12)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* タイトル */}
      <h3
        onClick={onRead}
        style={{ cursor: "pointer", marginBottom: "0.4rem" }}
      >
        {poem.title || "(無題)"}
      </h3>

      {/* プレビュー */}
      <div
        onClick={onRead}
        style={{
          whiteSpace: "pre-wrap",
          cursor: "pointer",
          flexGrow: 1,
        }}
      >
        {previewText}
      </div>

      {/* タグ */}
      <div
        style={{
          marginTop: "0.6rem",
          display: "flex",
          gap: "0.4rem",
          flexWrap: "wrap",
        }}
      >
        {(poem.tags || []).map((tag, i) => (
          <TagPill
            key={i}
            label={tag}
            theme={safeTheme}
            onClick={() => onTagClick(tag)}
          />
        ))}
      </div>

      {/* 操作ボタン */}
      <div
        style={{
          marginTop: "1rem",
          position: "relative",
          textAlign: "center",
        }}
      >
        <button
          onClick={onRead}
          style={{
            padding: "0.5rem 1.4rem",
            borderRadius: "20px",
            background: colors.readBg,
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          読む
        </button>

        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              position: "absolute",
              left: 0,
              padding: "0.4rem 0.75rem",
              borderRadius: "8px",
              background: colors.editBg,
              border: "none",
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            編集
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            style={{
              position: "absolute",
              right: 0,
              padding: "0.4rem",
              borderRadius: "50%",
              background: colors.deleteBg,
              border: "none",
              cursor: "pointer",
            }}
          >
            <DeleteIcon style={{ color: "#fff", fontSize: "1.1rem" }} />
          </button>
        )}
      </div>
    </div>
  );
}
