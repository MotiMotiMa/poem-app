// =======================================================
// /api/evaluate-poem-router.js
// Gemini / GPT 評価API 切替ルーター（安全版）
// =======================================================

import evaluateGem from "./evaluate-poem-gem.js";
import evaluateGpt from "./evaluate-poem.js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const provider =
    req.headers["x-ai-provider"] ||
    process.env.DEFAULT_AI_PROVIDER ||
    "gemini";

  try {
    if (provider === "gpt") {
      return evaluateGpt(req, res);
    } else {
      return evaluateGem(req, res);
    }
  } catch (err) {
    console.error("evaluate-poem-router error:", err);
    return res.status(500).json({ error: "AI router failed" });
  }
}
