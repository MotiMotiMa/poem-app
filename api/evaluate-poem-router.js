// =======================================================
// /api/evaluate-poem-router.js
// Gemini / GPT 評価API 切替ルーター
// =======================================================

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ----------------------
  // 切替ルール
  // ----------------------
  // 優先順：
  // 1. リクエストヘッダ x-ai-provider
  // 2. 環境変数 DEFAULT_AI_PROVIDER
  // 3. gemini（安全第一）
  // ----------------------
  const provider =
    req.headers["x-ai-provider"] ||
    process.env.DEFAULT_AI_PROVIDER ||
    "gemini";

  let targetUrl;

  switch (provider) {
    case "gpt":
      targetUrl = "/api/evaluate-poem";
      break;
    case "gemini":
    default:
      targetUrl = "/api/evaluate-poem-gem";
      break;
  }

  try {
    const response = await fetch(
      `${req.headers.origin}${targetUrl}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    console.error("evaluate router error:", err);
    return res.status(500).json({
      error: "AI router failed",
    });
  }
}
