export default function PoemTextarea({ value, onChange, colors }) {
  return (
    <>
      <label style={{ display: "block", fontWeight: "600", color: colors.label }}>
        詩の本文
      </label>
      <textarea
        rows={6}
        placeholder="詩を入力してください…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "0.8rem",
          borderRadius: "8px",
          border: `1px solid ${colors.inputBorder}`,
          background: colors.inputBg,
          color: colors.text,
          marginBottom: "1rem",
          whiteSpace: "pre-wrap",
        }}
      />
    </>
  );
}
