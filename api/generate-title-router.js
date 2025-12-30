// =======================================================
// /api/generate-title-router.js
// Gemini / GPT タイトル生成 切替ルーター
// =======================================================

// /api/generate-title-router.js
// fetch を使わない安全版

import generateTitleGem from "./generate-title-gem";
import generateTitleGpt from "./generate-title";

export default function handler(req, res) {
  const provider =
    req.headers["x-ai-provider"] ||
    process.env.DEFAULT_AI_PROVIDER ||
    "gemini";

  return provider === "gpt"
    ? generateTitleGpt(req, res)
    : generateTitleGem(req, res);
}
