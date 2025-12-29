export default function TitleGenerateButton({
  onClick,
  isGenerating,
  hasError,
  palette,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isGenerating}
      style={{
        marginBottom: "0.8rem",
        background: "none",
        border: "none",
        color: palette.text,
        opacity: isGenerating ? 0.5 : 0.7,
        fontSize: "0.85rem",
        cursor: "pointer",
      }}
    >
      {!isGenerating && "タイトルを生成する"}
      {isGenerating && (
        <span style={{ display: "flex", gap: "0.5rem" }}>
          <span
            style={{
              width: 14,
              height: 14,
              border: `2px solid ${palette.text}`,
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.9s linear infinite",
            }}
          />
          タイトルを考えています
        </span>
      )}
    </button>
  );
}
