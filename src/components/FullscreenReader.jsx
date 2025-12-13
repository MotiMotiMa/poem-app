// ======================================================================
// FullscreenReader.jsx（theme-safe × emotion-sync × TagPill統一 / 最終形）
// ======================================================================

import TagPill from "./TagPill";

export default function FullscreenReader({
  poem,
  onClose,
  onTagClick,
  theme,
}) {
  if (!poem) return null;

  // -----------------------------------------
  // theme の安全化（undefined → light）
  // -----------------------------------------
  const safeTheme = theme || "light";
  const isDark = safeTheme === "dark";

  // -----------------------------------------
  // Emotion × Theme の背景グラデーション統一
  // PoemCard / Carousel と完全同期
  // -----------------------------------------
  const bgGradient = {
    warm: isDark
      ? "linear-gradient(135deg, #4e3b32, #814e33)"
      : "linear-gradient(135deg, #ffecd2, #fcb69f)",
    cool: isDark
      ? "linear-gradient(135deg, #3b4248, #556067)"
      : "linear-gradient(135deg, #cfd9df, #e2ebf0)",
    dark: isDark
      ? "linear-gradient(135deg, #1a1f24, #2f3a40)"
      : "linear-gradient(135deg, #2c3e50, #4ca1af)",
    light: isDark
      ? "linear-gradient(135deg, #4f3c66, #3d4f6b)"
      : "linear-gradient(135deg, #e0c3fc, #8ec5fc)",
    love: isDark
      ? "linear-gradient(135deg, #5b2e3c, #7c3a4d)"
      : "linear-gradient(135deg, #ff9a9e, #fecfef)",
    sorrow: isDark
      ? "linear-gradient(135deg, #2f4962, #3b5b77)"
      : "linear-gradient(135deg, #a1c4fd, #c2e9fb)",
    growth: isDark
      ? "linear-gradient(135deg, #3c4d32, #4f6a40)"
      : "linear-gradient(135deg, #d4fc79, #96e6a1)",
  };

  // -----------------------------------------
  // テキスト & コメント背景の統一カラー
  // -----------------------------------------
  const textColor = isDark ? "#f5f5f5" : "#222";
  const commentBg = isDark
    ? "rgba(0,0,0,0.35)"
    : "rgba(255,255,255,0.55)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: bgGradient[poem.emotion] || (isDark ? "#111" : "#fff"),
        padding: "3rem 1.5rem",
        overflowY: "auto",
        zIndex: 9999,
        fontFamily: "'YuMincho', serif",
        color: textColor,
        animation: "fadeIn 0.3s ease",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      {/* ✕ 閉じる */}
      <button
        onClick={onClose}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "0.4rem 0.8rem",
          border: "none",
          background: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.5)",
          color: "#fff",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
        }}
      >
        ✕ 閉じる
      </button>

      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* タイトル */}
        <h1
          style={{
            textAlign: "center",
            marginBottom: "1rem",
            color: textColor,
            wordBreak: "break-word",
          }}
        >
          {poem.title}
        </h1>

        {/* スコアバッジ（theme対応） */}
        <div
          style={{
            display: "inline-block",
            padding: "0.35rem 1rem",
            borderRadius: "20px",
            fontSize: "0.9rem",
            fontWeight: 500,
            marginBottom: "1.2rem",
            background: isDark
              ? "rgba(255,255,255,0.15)"
              : "rgba(255,255,255,0.55)",
            color: isDark ? "#fafafa" : "#333",
            border: isDark
              ? "1px solid rgba(255,255,255,0.25)"
              : "1px solid rgba(0,0,0,0.15)",
            backdropFilter: "blur(5px)",
          }}
        >
          評価 {poem.score ?? "-"}
        </div>

        {/* 詩本文 */}
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontSize: "1.3rem",
            lineHeight: "2.2rem",
            textAlign: "center",
            marginBottom: "2rem",
            color: textColor,
          }}
        >
          {poem.poem}
        </pre>

        {/* タグ（TagPill と theme完全同期） */}
        <div
          style={{
            textAlign: "center",
            marginTop: "1.2rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.6rem",
            justifyContent: "center",
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

        {/* AIコメント */}
        {poem.comment && (
          <p
            style={{
              marginTop: "2rem",
              padding: "1rem",
              background: commentBg,
              borderRadius: "8px",
              whiteSpace: "pre-wrap",
              color: textColor,
            }}
          >
            {poem.comment}
          </p>
        )}
      </div>
    </div>
  );
}
