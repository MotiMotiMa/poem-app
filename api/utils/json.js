// =======================================================
// /api/utils/json.js
// JSON安全パース用ユーティリティ
// =======================================================

export function safeParseJSON(text) {
  if (typeof text !== "string") return null;

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}
