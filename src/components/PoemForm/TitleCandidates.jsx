export default function TitleCandidates({ titleCandidates, onPick, colors }) {
  if (!titleCandidates || titleCandidates.length === 0) return null;

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

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        {titleCandidates.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(c)}
            style={{
              padding: "0.4rem 0.7rem",
              borderRadius: "6px",
              background: colors.candidateBg,
              border: "none",
              color: colors.text,
              fontSize: "0.9rem",
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
