export default function TitleInput({ value, onChange, colors }) {
  return (
    <>
      <label style={{ display: "block", fontWeight: "600", color: colors.label }}>
        題名
      </label>
      <input
        type="text"
        placeholder="（題名を入力）"
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
        }}
      />
    </>
  );
}
