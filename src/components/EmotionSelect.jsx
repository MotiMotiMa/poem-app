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
        {/* 既存 */}
        <option value="warm" translate="no">warm（優しい・懐かしい）</option>
        <option value="cool" translate="no">cool（静けさ・孤独）</option>
        <option value="dark" translate="no"> dark（苦しみ・影）</option>
        <option value="light" translate="no">light（希望・光）</option>
        <option value="love" translate="no">love（恋・親密・繋がり）</option>
        <option value="sorrow" translate="no">sorrow（悲しみ・喪失）</option>
        <option value="growth" translate="no">growth（変化・再生）</option>
        <option value="nostalgia" translate="no">nostalgia（郷愁・思い出）</option>
        <option value="void" translate="no">void（空虚・無）</option>
      </select>
    </>
  );
}
