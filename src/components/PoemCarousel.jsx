// =======================================================
// PoemCarousel.jsx（KEY対応・final）
// =======================================================

import React, { useRef, useCallback } from "react";
import PoemCard from "./PoemCard";

export default function PoemCarousel({
  poems = [],          // ← 念のためデフォルト
  user,
  onEdit,
  onDelete,
  onTagClick,
  onRead,
  theme,
}) {
  const containerRef = useRef(null);

  // -------------------------
  // theme 安全化
  // -------------------------
  const safeTheme = theme || "light";
  const isDark = safeTheme === "dark";
  const btnBG = isDark ? "#444444aa" : "#00000055";

  // -------------------------
  // スクロール制御
  // -------------------------
  const scrollByAmount = useCallback((amount) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        marginBottom: "2rem",
      }}
    >
      {/* 左スクロール */}
      <button
        onClick={() => scrollByAmount(-320)}
        style={{
          position: "absolute",
          left: "5px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 5,
          padding: "0.5rem",
          borderRadius: "50%",
          border: "none",
          background: btnBG,
          color: "#fff",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
        }}
      >
        ◀
      </button>

      {/* カルーセル本体 */}
      <div
        ref={containerRef}
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          gap: "1rem",
          padding: "1rem",
          scrollbarWidth: "none",
        }}
      >
        {(poems || []).map((p) => {
          const isOwner = user && user.id === p.user_id;

          return (
            <div
              key={`${p.id}-${user?.id ?? "guest"}`}
              style={{
                scrollSnapAlign: "center",
                flex: "0 0 auto",
              }}
            >
              <PoemCard
                poem={p}
                theme={safeTheme}
                onRead={() => onRead(p)}
                onTagClick={onTagClick}

                // 🔐 編集・削除は「自分の詩のみ」
                onEdit={isOwner ? () => onEdit(p) : null}
                onDelete={isOwner ? () => onDelete(p.id) : null}
              />
            </div>
          );
        })}
      </div>

      {/* 右スクロール */}
      <button
        onClick={() => scrollByAmount(320)}
        style={{
          position: "absolute",
          right: "5px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 5,
          padding: "0.5rem",
          borderRadius: "50%",
          border: "none",
          background: btnBG,
          color: "#fff",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
        }}
      >
        ▶
      </button>
    </div>
  );
}
