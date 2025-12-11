// ===============================================
// theme.js（全ページ共通のライト/ダークテーマ設定）
// ===============================================

export const LightTheme = {
  mode: "light",
  bg: "#f2f4f7",         // 柔らかい薄グレー
  card: "#ffffff",
  text: "#2c2c2c",
  border: "#d0d5dd",

  primary: "#3b82f6",     // 青
  accentPink: "#f472b6",  // ピンク
  accentGreen: "#34d399", // エメラルド
};

export const DarkTheme = {
  mode: "dark",
  bg: "#0f172a",         // 青系ブラック
  card: "#1e293b",
  text: "#e2e8f0",
  border: "#334155",

  primary: "#60a5fa",
  accentPink: "#f9a8d4",
  accentGreen: "#6ee7b7",
};

// ===============================================
// isDark の廃止 → App 全体で theme を固定
// ===============================================

export function getTheme(themeMode) {
  return themeMode === "dark" ? DarkTheme : LightTheme;
}
