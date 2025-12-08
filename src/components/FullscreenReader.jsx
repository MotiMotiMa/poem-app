// =============================================
// FullscreenReader.jsx（レベル9 読書モード）
// =============================================

export default function FullscreenReader({ poem, onClose, onTagClick }) {
  if (!poem) return null;

  const gradient = {
    warm: "linear-gradient(135deg, #ffecd2, #fcb69f)",
    cool: "linear-gradient(135deg, #cfd9df, #e2ebf0)",
    dark: "linear-gradient(135deg, #2c3e50, #4ca1af)",
    light: "linear-gradient(135deg, #e0c3fc, #8ec5fc)",
    love: "linear-gradient(135deg, #ff9a9e, #fecfef)",
    sorrow: "linear-gradient(135deg, #a1c4fd, #c2e9fb)",
    growth: "linear-gradient(135deg, #d4fc79, #96e6a1)",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: gradient[poem.emotion] || "#fff",
        padding: "3rem 1.5rem",
        overflowY: "auto",
        zIndex: 9999,
        color: "#222",
        fontFamily: "'YuMincho', serif",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* 閉じるボタン */}
      <button
        onClick={onClose}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "0.4rem 0.8rem",
          border: "none",
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        ✕ 閉じる
      </button>

      <div style={{ maxWidth: "650px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
          {poem.title}
        </h1>

        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontSize: "1.3rem",
            lineHeight: "2.2rem",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          {poem.poem}
        </pre>

        {/* タグ */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          {(poem.tags || []).map((t, i) => (
            <span
              key={i}
              onClick={() => onTagClick(t)}
              style={{
                display: "inline-block",
                padding: "0.4rem 0.8rem",
                background: "rgba(255,255,255,0.6)",
                margin: "0.2rem",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            >
              #{t}
            </span>
          ))}
        </div>

        {/* コメント（AIレビュー） */}
        {poem.comment && (
          <p
            style={{
              marginTop: "2rem",
              padding: "1rem",
              background: "rgba(255,255,255,0.5)",
              borderRadius: "8px",
              whiteSpace: "pre-wrap",
            }}
          >
            {poem.comment}
          </p>
        )}
      </div>
    </div>
  );
}
