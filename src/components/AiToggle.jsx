// components/AiToggle.jsx
export default function AiToggle({
  value,
  onChange,
  disabled,
  palette,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.4rem 0.6rem",
        border: `1px solid ${palette.border}`,
        borderRadius: 10,
        background: palette.bg2,
      }}
    >
      <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
        AI: <b>{value === "gpt" ? "GPT" : "Gemini"}</b>
      </span>

      <div style={{ display: "flex", gap: "0.3rem", marginLeft: "auto" }}>
        {["gpt", "gemini"].map((p) => (
          <button
            key={p}
            type="button"
            disabled={value === p || disabled}
            onClick={() => onChange(p)}
            style={{
              padding: "0.3rem 0.55rem",
              borderRadius: 8,
              border: `1px solid ${palette.border}`,
              background: value === p ? palette.main : "transparent",
              color: value === p ? "#fff" : palette.text,
              fontSize: "0.8rem",
              cursor: value === p ? "default" : "pointer",
            }}
          >
            {p === "gpt" ? "GPT" : "Gemini"}
          </button>
        ))}
      </div>
    </div>
  );
}
