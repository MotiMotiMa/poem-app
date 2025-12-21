import { useState, useMemo } from "react";
import { emotionPalette } from "../../styles/emotionPalette";

import PoemBody from "./PoemBody";
import PoemMeta from "./PoemMeta";
import PoemComment from "./PoemComment";

export default function FullscreenReader({ poem, onClose, theme }) {
  // -----------------------------
  // Hooks は最上部固定
  // -----------------------------
  const [showComment, setShowComment] = useState(false);

  const safeTheme = theme || "light";
  const emotion = poem?.emotion || "light";

  // -----------------------------
  // emotionPalette を「参照だけ」
  // -----------------------------
  const palette = useMemo(() => {
    return (
      emotionPalette?.[emotion]?.[safeTheme] ||
      emotionPalette.light.light
    );
  }, [emotion, safeTheme]);

  // -----------------------------
  // ガードは Hooks の後
  // -----------------------------
  if (!poem) return null;

  return (
    <div
      className="fullscreen"
      style={{
        color: palette.text,
      }}
    >
      {/* 閉じる */}
      <button
        onClick={onClose}
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          background: "none",
          border: "none",
          color: palette.text,
          fontSize: "1.1rem",
          opacity: 0.8,
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      <PoemMeta poem={poem} theme={safeTheme} palette={palette} />

      <PoemBody poem={poem} />

      <div style={{ height: "2rem" }} />

      {!showComment && poem.comment && (
        <button
          onClick={() => setShowComment(true)}
          style={{
            opacity: 0.65,
            background: "none",
            border: "none",
            color: palette.text,
            cursor: "pointer",
          }}
        >
          静かなコメントを開く
        </button>
      )}

      {showComment && (
        <PoemComment
          comment={poem.comment}
          poemText={poem.poem}
          palette={palette}
        />
      )}
    </div>
  );
}
