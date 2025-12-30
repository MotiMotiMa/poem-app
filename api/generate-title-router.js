// =======================================================
// /api/generate-title-router.js
// Gemini / GPT タイトル生成 切替ルーター（Node固定）
// =======================================================

import generateTitleGem from "./generate-title-gem.js";
import generateTitleGpt from "./generate-title.js";

export const config = { runtime: "nodejs" };

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const provider =
    req.headers["x-ai-provider"] ||
    process.env.DEFAULT_AI_PROVIDER ||
    "gemini";

  return provider === "gpt"
    ? generateTitleGpt(req, res)
    : generateTitleGem(req, res);
}
