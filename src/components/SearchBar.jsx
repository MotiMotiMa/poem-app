/* C:\Users\PC_User\poem-app\src\components\SearchBar.jsx */

export default function SearchBar({ value, onChange, theme = "light" }) {
  const isDark = theme === "dark";

  // UI palette（アプリ全体で統一）
  const colors = {
    bg: isDark ? "#2a2a2a" : "#ffffff",
    border: isDark ? "#555" : "#ccc",
    text: isDark ? "#f1f1f1" : "#222",
    placeholder: isDark ? "#bbbbbb" : "#888888",
    shadow: isDark
      ? "0 2px 6px rgba(0,0,0,0.45)"
      : "0 2px 6px rgba(0,0,0,0.1)",
  };

  return (
    <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="詩を検索（タイトル・本文・emotion・コメント）"
        style={{
          width: "80%",
          maxWidth: "420px",
          padding: "0.7rem 1rem",
          borderRadius: "8px",
          fontSize: "1rem",

          background: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          boxShadow: colors.shadow,
          transition: "0.25s ease",

          // iOS・Safari 対応
          WebkitAppearance: "none",
          outline: "none",
        }}
        onFocus={(e) => {
          e.target.style.border = `1px solid ${
            isDark ? "#7cc2ff" : "#2980b9"
          }`;
        }}
        onBlur={(e) => {
          e.target.style.border = `1px solid ${colors.border}`;
        }}
      />
      {/* placeholder 色の適用 */}
      <style>
        {`
        input::placeholder {
          color: ${colors.placeholder};
        }
      `}
      </style>
    </div>
  );
}
