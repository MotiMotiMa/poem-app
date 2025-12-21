import { useState } from "react";

export default function TitleCandidates({
  titleCandidates,
  onPick,
  colors,
}) {
  // -----------------------------
  // Hooks は最上部
  // -----------------------------
  const [picked, setPicked] = useState(null);

  // -----------------------------
  // ガードは Hooks の後
  // -----------------------------
  if (!titleCandidates || titleCandidates.length === 0) return null;

  const normalTitles = titleCandidates.slice(0, 3);
  const aggressiveTitle = titleCandidates[3];

  const handlePick = (title) => {
    setPicked(title);
    onPick?.(title);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label
        style={{
          display: "block",
          fontWeight: "600",
          color: colors.label,
          marginBottom: "0.3rem",
        }}
      >
        AIタイトル候補
      </label>

      {/* 通常タイトル */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: aggressiveTitle ? "0.4rem" : 0,
        }}
      >
        {normalTitles.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handlePick(c)}
            style={{
              padding: "0.4rem 0.7rem",
              borderRadius: "6px",
              background: colors.candidateBg,
              border: "none",
              color: colors.text,
              fontSize: "0.9rem",
              cursor: "pointer",
              opacity: picked && picked !== c ? 0.55 : 1,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 攻めすぎタイトル */}
      {aggressiveTitle && (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => handlePick(aggressiveTitle)}
            style={{
              padding: "0.35rem 0.6rem",
              borderRadius: "6px",
              background: colors.candidateBg,
              border: "none",
              color: colors.text,
              fontSize: "0.8rem",
              opacity: picked && picked !== aggressiveTitle ? 0.4 : 0.62,
              cursor: "pointer",
            }}
          >
            {aggressiveTitle}
          </button>
        </div>
      )}
    </div>
  );
}
