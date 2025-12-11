// =======================================================
// SubmitButton.jsx（完全安定版・ぐるぐる封印）
// =======================================================

import React from "react";

export default function SubmitButton({
  editingPoem,
  palette,
  disabled,
  isLoading, // ← 親から渡す
}) {
  const spinner = (
    <div
      style={{
        width: "18px",
        height: "18px",
        border: `3px solid ${palette.spinnerTrack}`,
        borderTop: `3px solid ${palette.spinnerHead}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "0 auto",
      }}
    />
  );

  return (
    <>
      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
      </style>

      <button
        type="submit"
        disabled={disabled || isLoading}
        style={{
          width: "100%",
          padding: "0.85rem 1.2rem",
          borderRadius: "10px",
          fontFamily: "'YuMincho', serif",
          fontSize: "1.08rem",
          background: palette.primary,
          color: palette.buttonText,
          border: "none",
          cursor: isLoading ? "default" : "pointer",
          opacity: isLoading ? 0.7 : 1,
          transition: "0.2s ease",
        }}
      >
        {isLoading
          ? spinner
          : editingPoem
          ? "✏️ 更新する"
          : "📜 投稿する"}
      </button>
    </>
  );
}
