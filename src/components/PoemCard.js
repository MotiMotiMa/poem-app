// src/components/PoemCard.js
import { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function getColorByScore(score) {
  if (score >= 80) return "#27ae60";
  if (score >= 50) return "#f39c12";
  return "#e74c3c";
}

function emotionTheme(emotion) {
  switch (emotion) {
    case "warm":
      return { bg: "linear-gradient(135deg, #ffe5e0, #ffd1cc)", border: "#f5b7b1" };
    case "cool":
      return { bg: "linear-gradient(135deg, #e0f7fa, #b2ebf2)", border: "#81d4fa" };
    case "dark":
      return { bg: "linear-gradient(135deg, #2f3542, #1e272e)", border: "#57606f" };
    case "light":
      return { bg: "linear-gradient(135deg, #fff9e6, #fff3c4)", border: "#f6e58d" };
    case "love":
      return { bg: "linear-gradient(135deg, #ffe6eb, #ffccd5)", border: "#ff99a9" };
    case "sorrow":
      return { bg: "linear-gradient(135deg, #dde1e7, #bec7d5)", border: "#a4b0be" };
    case "growth":
      return { bg: "linear-gradient(135deg, #e9f7ef, #d4efdf)", border: "#a9dfbf" };
    default:
      return { bg: "#ffffff", border: "#dfe6e9" };
  }
}

function emotionIcon(emotion) {
  switch (emotion) {
    case "warm":
      return "🔥";
    case "cool":
      return "💧";
    case "dark":
      return "🌑";
    case "light":
      return "☀️";
    case "love":
      return "💗";
    case "sorrow":
      return "🌧️";
    case "growth":
      return "🌱";
    default:
      return "✒️";
  }
}

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  if (typeof tags === "string")
    return tags.split(/[、,\n]/).map((t) => t.trim()).filter(Boolean);
  return [];
}

export default function PoemCard({ poem, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const scoreNum = Number(poem.score);

  const isDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const theme = emotionTheme(poem.emotion);
  const icon = emotionIcon(poem.emotion);
  const tagList = normalizeTags(poem.tags);

  const poemStyle = {
    whiteSpace: "pre-wrap",
    fontFamily: "'YuMincho', serif",
    fontSize: "1.05rem",
    lineHeight: "1.85",
    letterSpacing: "0.03em",
    wordBreak: "break-word",
    overflowWrap: "break-word",
  };

  const commentStyle = {
    whiteSpace: "pre-wrap",
    fontSize: "0.95rem",
    lineHeight: "1.75",
    letterSpacing: "0.02em",
    wordBreak: "break-word",
    overflowWrap: "break-word",
    textAlign: "left",
  };

  return (
    <>
      {/* 一覧のカード */}
      <div
        onClick={() => setOpen(true)}
        style={{
          background: theme.bg,
          borderRadius: "16px",
          padding: "1rem",
          width: "100%",
          maxWidth: "340px",
          boxShadow: isDark
            ? "0 4px 12px rgba(0,0,0,0.7)"
            : "0 4px 12px rgba(0,0,0,0.15)",
          border: `1px solid ${theme.border}`,
          margin: "0 auto",
          cursor: "pointer",
          color: isDark ? "#f1f2f6" : "#2d3436",
        }}
      >
        {poem.title && (
          <h2
            style={{
              fontSize: "1.25rem",
              marginBottom: "0.3rem",
              fontWeight: "700",
            }}
          >
            {icon} {poem.title}
          </h2>
        )}

        {/* emotion バッジ（強化版） */}
        {poem.emotion && (
          <div
            style={{
              display: "inline-block",
              padding: "0.28rem 0.7rem",
              borderRadius: "999px",
              fontSize: "0.8rem",
              marginBottom: "0.5rem",
              backdropFilter: "blur(4px)",
              border: `1px solid ${theme.border}`,
              color: isDark ? "#f1f2f6" : "#2d3436",
              background: "rgba(255,255,255,0.45)",
              fontWeight: "600",
            }}
          >
            {icon} {poem.emotion}
          </div>
        )}

        {/* タグ */}
        {tagList.length > 0 && (
          <div
            style={{
              marginTop: "0.3rem",
              marginBottom: "0.6rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.3rem",
              justifyContent: "center",
            }}
          >
            {tagList.map((tag, i) => (
              <span
                key={i}
                style={{
                  fontSize: "0.75rem",
                  padding: "0.15rem 0.4rem",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.6)",
                  color: "#2d3436",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 詩 抜粋 */}
        <p style={{ ...poemStyle, textAlign: "left", marginTop: "0.5rem" }}>
          {poem.poem.length > 60 ? poem.poem.slice(0, 60) + "…" : poem.poem}
        </p>

        {/* スコア */}
        <div style={{ width: "90px", height: "90px", margin: "1rem auto" }}>
          <CircularProgressbar
            value={scoreNum}
            maxValue={100}
            text={`${scoreNum}`}
            styles={buildStyles({
              pathColor: getColorByScore(scoreNum),
              textColor: "#2d3436",
              trailColor: "#b2bec3",
              textSize: "18px",
            })}
          />
        </div>

        <small style={{ display: "block", opacity: 0.7 }}>
          {new Date(poem.created_at).toLocaleString()}
        </small>

        {/* 編集・削除 */}
        <div
          style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            style={{
              flex: 1,
              padding: "0.5rem",
              background: "#0984e3",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
            }}
            onClick={() => onEdit(poem)}
          >
            編集
          </button>
          <button
            style={{
              flex: 1,
              padding: "0.5rem",
              background: "#d63031",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
            }}
            onClick={() => onDelete(poem.id)}
          >
            削除
          </button>
        </div>
      </div>

      {/* モーダル（詳細ビュー） */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(3px)",
            zIndex: 9999,
            padding: "1rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme.bg,
              border: `2px solid ${theme.border}`,
              borderRadius: "12px",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
              color: isDark ? "#f1f2f6" : "#2d3436",
              fontFamily: "'YuMincho', serif",
            }}
          >
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  fontSize: "1.4rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                ✖
              </button>
            </div>

            {poem.title && (
              <h2
                style={{
                  fontSize: "1.6rem",
                  marginBottom: "0.5rem",
                  fontWeight: "700",
                }}
              >
                {icon} {poem.title}
              </h2>
            )}

            {/* モーダル側 emotion バッジ */}
            {poem.emotion && (
              <div
                style={{
                  display: "inline-block",
                  padding: "0.32rem 0.9rem",
                  borderRadius: "999px",
                  fontSize: "0.9rem",
                  marginBottom: "0.8rem",
                  backdropFilter: "blur(4px)",
                  border: `1px solid ${theme.border}`,
                  background: "rgba(255,255,255,0.45)",
                  fontWeight: "600",
                }}
              >
                {icon} {poem.emotion}
              </div>
            )}

            {/* タグ */}
            {tagList.length > 0 && (
              <div
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.4rem",
                }}
              >
                {tagList.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.7)",
                      color: "#2d3436",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p style={{ ...poemStyle, marginBottom: "1.4rem" }}>
              {poem.poem}
            </p>

            <div
              style={{
                width: "140px",
                height: "140px",
                margin: "1.4rem auto",
              }}
            >
              <CircularProgressbar
                value={scoreNum}
                maxValue={100}
                text={`${scoreNum}`}
                styles={buildStyles({
                  pathColor: getColorByScore(scoreNum),
                  textColor: "#2d3436",
                  trailColor: "#b2bec3",
                  textSize: "22px",
                })}
              />
            </div>

            <p style={commentStyle}>
              <strong>💬 コメント</strong>
              <br />
              {poem.comment}
            </p>

            {poem.status && (
              <p
                style={{
                  fontStyle: "italic",
                  opacity: 0.9,
                  marginTop: "0.5rem",
                  fontSize: "0.85rem",
                }}
              >
                {poem.status}
              </p>
            )}

            <small style={{ display: "block", marginTop: "0.8rem", opacity: 0.8 }}>
              {new Date(poem.created_at).toLocaleString()}
            </small>
          </div>
        </div>
      )}
    </>
  );
}
