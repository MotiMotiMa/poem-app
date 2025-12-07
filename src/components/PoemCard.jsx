import React from "react";
import { useNavigate } from "react-router-dom";

export default function PoemCard({ poem, onEdit, onDelete }) {
  const navigate = useNavigate();

  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const colors = {
    card: isDark ? "#2e2e2e" : "#ffffff",
    text: isDark ? "#f1f2f6" : "#2d3436",
    border: isDark ? "#555" : "#ddd",
    buttonBg: isDark ? "#555" : "#eee",
  };

  return (
    <div
      onClick={() => navigate(`/poem/${poem.id}`)}
      style={{
        width: "280px",
        padding: "1rem",
        borderRadius: "12px",
        background: colors.card,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        boxShadow: isDark
          ? "0 4px 12px rgba(0,0,0,0.5)"
          : "0 4px 12px rgba(0,0,0,0.1)",
        cursor: "pointer",
        position: "relative",
      }}
    >
      {/* タイトル */}
      <h3 style={{ margin: "0 0 .5rem 0" }}>{poem.title || "（無題）"}</h3>

      {/* 本文の先頭だけチラ見せ */}
      <p
        style={{
          margin: "0 0 .5rem 0",
          fontSize: "0.9rem",
          whiteSpace: "pre-wrap",
          opacity: 0.8,
        }}
      >
        {poem.poem?.slice(0, 40)}…
      </p>

      {/* emotion / tags */}
      <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
        感情: {poem.emotion}
      </div>

      {poem.tags && poem.tags.length > 0 && (
        <div
          style={{
            marginTop: "0.4rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.2rem",
          }}
        >
          {poem.tags.map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: "0.75rem",
                padding: "0.2rem 0.4rem",
                background: colors.buttonBg,
                borderRadius: "4px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* --- 編集／削除ボタン（カードクリックとは独立） --- */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          marginTop: "0.8rem",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(poem);
          }}
          style={{
            flex: 1,
            padding: "0.4rem",
            borderRadius: "6px",
            border: "none",
            background: "#74b9ff",
            color: "#fff",
            fontWeight: "600",
          }}
        >
          編集
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("削除しますか？")) onDelete(poem.id);
          }}
          style={{
            flex: 1,
            padding: "0.4rem",
            borderRadius: "6px",
            border: "none",
            background: "#ff7675",
            color: "#fff",
            fontWeight: "600",
          }}
        >
          削除
        </button>
      </div>
    </div>
  );
}
