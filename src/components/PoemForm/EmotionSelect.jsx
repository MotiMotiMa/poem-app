export default function EmotionSelect({ value, onChange, colors }) {
  return (
    <>
      <label style={{ display: "block", fontWeight: "600", color: colors.label }}>
        感情テーマ（AIが自動生成します）
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "0.7rem",
          borderRadius: "8px",
          marginBottom: "1.2rem",
          background: colors.inputBg,
          border: `1px solid ${colors.inputBorder}`,
          color: colors.text,
        }}
      >
        <option value="warm">warm（優しい・懐かしい）</option>
        <option value="cool">cool（静けさ・孤独）</option>
        <option value="dark">dark（苦しみ・影）</option>
        <option value="light">light（希望・光）</option>
      </select>
    </>
  );
}
