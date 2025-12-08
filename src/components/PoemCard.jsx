// ===============================================
// PoemCard.jsx（レベル7：カード裏返し・トレカ化 + emotionバッジ）
// ===============================================

import React, { useState, useMemo } from "react";

export default function PoemCard({ poem, onEdit, onDelete, onTagClick }) {
  const [flipped, setFlipped] = useState(false);

  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  // emotion 色
  const baseColors = {
    warm: ["#ff9a76", "#ff6b6b"],
    cool: ["#74b9ff", "#a29bfe"],
    dark: ["#2d3436", "#000000"],
    light: ["#ffeaa7", "#fdcb6e"],
    love: ["#ff6fb1", "#ff3d67"],
    sorrow: ["#6c5ce7", "#4c3fb1"],
    growth: ["#55efc4", "#00b894"],
  };

  const [b1, b2] = baseColors[poem.emotion] || ["#555", "#333"];

  // emotionバッジ（上品なミニバッジ） ---------------------
  const emotionBadge = (
    <div
      style={{
        position: "absolute",
        top: "8px",
        left: "8px",
        padding: "4px 10px",
        borderRadius: "12px",
        background: `linear-gradient(135deg, ${b1}, ${b2})`,
        color: "#fff",
        fontSize: "0.65rem",
        fontWeight: "bold",
        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        zIndex: 5, // 背景エフェクトに負けない
        pointerEvents: "none", // クリック妨害しない
      }}
    >
      {poem.emotion}
    </div>
  );

  // seed 生成
  const seed = useMemo(() => {
    let s = 0;
    const str = poem.id + poem.title + poem.poem;
    for (let i = 0; i < str.length; i++) {
      s = (s * 31 + str.charCodeAt(i)) % 100000;
    }
    return s;
  }, [poem.id, poem.title, poem.poem]);

  // 擬似乱数
  const rand = (x) =>
    parseFloat("0." + Math.sin(seed * (x + 1) * 9973).toString().slice(-6));

  // 背景の揺らぎ（前面も背面も共通）
  const noiseStyle = {
    position: "absolute",
    top: "-30%",
    left: "-30%",
    width: "160%",
    height: "160%",
    zIndex: 0,
    background: `radial-gradient(circle at ${rand(1) * 100}% ${
      rand(2) * 100
    }%, ${b1}33, transparent 70%)`,
    filter: "blur(55px)",
    animation: "bgPulse 8s ease-in-out infinite",
  };

  const noiseStyle2 = {
    position: "absolute",
    top: "-30%",
    left: "-30%",
    width: "160%",
    height: "160%",
    zIndex: 0,
    background: `conic-gradient(from ${rand(3) * 360}deg, ${b2}22, transparent, ${b1}22)`,
    mixBlendMode: "soft-light",
    filter: "blur(55px)",
    animation: "bgDrift 13s ease-in-out infinite",
  };

  // タグスタイル
  const tagStyle = {
    padding: "4px 10px",
    borderRadius: "20px",
    background: `linear-gradient(135deg, ${b1}, ${b2})`,
    color: "#fff",
    fontSize: "0.75rem",
    display: "inline-block",
    marginRight: "6px",
    marginBottom: "6px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    transition: "transform 0.2s ease",
    zIndex: 3,
    position: "relative",
  };

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      style={{
        width: "300px",
        height: "260px",
        perspective: "1000px",
      }}
    >
      {/* カードの回転コンテナ */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.7s ease",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ======== Front Side ======== */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            background: isDark ? "#2b2b2b" : "#ffffff",
            borderRadius: "16px",
            padding: "1.4rem",
            overflow: "hidden",
            boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
            animation: "pulseShadow 4s ease-in-out infinite",
          }}
        >
          {emotionBadge}

          <div style={noiseStyle}></div>
          <div style={noiseStyle2}></div>

          <div style={{ position: "relative", zIndex: 3 }}>
            <h3
              style={{
                margin: 0,
                marginBottom: "0.4rem",
                fontFamily: "'YuMincho', serif",
              }}
            >
              {poem.title}
            </h3>

            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
              ⭐ Score: {poem.score}
            </div>

            <div
              dangerouslySetInnerHTML={{
                __html: poem.poem.replace(/\n/g, "<br />"),
              }}
              style={{
                marginTop: "0.5rem",
                fontSize: "0.82rem",
                maxHeight: "80px",
                overflow: "hidden",
              }}
            />

            {/* タグ表示 */}
            <div style={{ marginTop: "0.6rem" }}>
              {(poem.tags || []).map((tag, i) => (
                <span
                  key={i}
                  style={tagStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick(tag);
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 編集・削除 */}
            <div
              style={{
                display: "flex",
                gap: "0.6rem",
                marginTop: "0.9rem",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  border: "none",
                  borderRadius: "6px",
                  background: "#74b9ff",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                編集
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  border: "none",
                  borderRadius: "6px",
                  background: "#ff7675",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                削除
              </button>
            </div>
          </div>
        </div>

        {/* ======== Back Side ======== */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            padding: "1.4rem",
            background: isDark ? "#252525" : "#fefefe",
            borderRadius: "16px",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            overflowY: "auto",
            boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
          }}
        >
          {emotionBadge}

          <h3
            style={{
              marginTop: 0,
              marginBottom: "0.6rem",
              fontFamily: "'YuMincho', serif",
            }}
          >
            詳細情報
          </h3>

          <p style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            <b>Emotion:</b> {poem.emotion}
          </p>

          <p style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            <b>AI コメント:</b><br />
            {poem.comment}
          </p>

          <p style={{ fontSize: "0.8rem", opacity: 0.85 }}>
            <b>作成日時:</b> {new Date(poem.created_at).toLocaleString()}
          </p>

          <div style={{ marginTop: "0.8rem" }}>
            <b>タグ詳細:</b>
            <div style={{ marginTop: "0.4rem" }}>
              {(poem.tags || []).map((tag, i) => (
                <span
                  key={i}
                  style={{
                    ...tagStyle,
                    fontSize: "0.7rem",
                    padding: "3px 8px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick(tag);
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
            }}
            style={{
              marginTop: "1rem",
              width: "100%",
              padding: "0.6rem",
              border: "none",
              borderRadius: "8px",
              background: "#636e72",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            裏面を閉じる
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes pulseShadow {
            0% { box-shadow: 0 4px 18px rgba(0,0,0,0.18); }
            50% { box-shadow: 0 8px 26px rgba(0,0,0,0.28); }
            100% { box-shadow: 0 4px 18px rgba(0,0,0,0.18); }
          }

          @keyframes bgPulse {
            0% { transform: scale(1); opacity: .45; }
            50% { transform: scale(1.08); opacity: .65; }
            100% { transform: scale(1); opacity: .45; }
          }

          @keyframes bgDrift {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(12deg); }
            100% { transform: rotate(0deg); }
          }
        `}
      </style>
    </div>
  );
}
