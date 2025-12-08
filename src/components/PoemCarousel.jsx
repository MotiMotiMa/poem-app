// ================================================
// PoemCarousel.jsx
// 横スワイプ式の詩カルーセル（レベル8）
// ================================================

import React, { useRef } from "react";
import PoemCard from "./PoemCard";

export default function PoemCarousel({ poems, onEdit, onDelete, onTagClick }) {
  const containerRef = useRef(null);

  const scrollByAmount = (amount) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", marginBottom: "2rem" }}>
      {/* 左ボタン */}
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
          background: "#00000055",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        ◀
      </button>

      {/* 横スクロールの実体 */}
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
        {poems.map((p) => (
          <div
            key={p.id}
            style={{
              scrollSnapAlign: "center",
              flex: "0 0 auto",
            }}
          >
            <PoemCard
              poem={p}
              onEdit={() => onEdit(p)}
              onDelete={() => onDelete(p.id)}
              onTagClick={onTagClick}
            />
          </div>
        ))}
      </div>

      {/* 右ボタン */}
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
          background: "#00000055",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        ▶
      </button>
    </div>
  );
}
