export default function SubmitButton({ editingPoem, colors }) {
  return (
    <button
      type="submit"
      style={{
        width: "100%",
        padding: "0.8rem",
        borderRadius: "10px",
        background: colors.buttonBg,
        color: colors.buttonText,
        border: "none",
        fontSize: "1.1rem",
        fontWeight: "600",
      }}
    >
      {editingPoem ? "更新する" : "投稿する"}
    </button>
  );
}
