import { useState, useMemo, useEffect, useRef } from "react";
import { emotionPalette } from "../../styles/emotionPalette";

import PoemBody from "./PoemBody";
import PoemMeta from "./PoemMeta";
import PoemComment from "./PoemComment";

export default function FullscreenReader({ poem, onClose, theme }) {
  // -----------------------------
  // Hooks は最上部固定
  // -----------------------------
  const [showComment, setShowComment] = useState(false);
  const [canShowComment, setCanShowComment] = useState(false);

  const endRef = useRef(null);

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
  // 読了検知（末尾が表示されたら解放）
  // -----------------------------
  useEffect(() => {
    if (!endRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCanShowComment(true);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(endRef.current);
    return () => observer.disconnect();
  }, []);

  // -----------------------------
  // ガード（Hooks の後）
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
          zIndex: 1000,
        }}
      >
        ✕
      </button>

      <PoemMeta poem={poem} theme={safeTheme} palette={palette} />

      <PoemBody poem={poem} />

      {/* 読了位置マーカー */}
      <div ref={endRef} style={{ height: "1px" }} />

      <div style={{ height: "2rem" }} />

      {/* 読了後にだけ入口が出る */}
      {canShowComment && !showComment && poem.comment && (
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
