// =======================================================
// /api/generate-title-router.js
// Gemini / GPT タイトル生成 切替ルーター
// =======================================================

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const provider =
    req.headers["x-ai-provider"] ||
    process.env.DEFAULT_AI_PROVIDER ||
    "gemini";

  let targetUrl;

  switch (provider) {
    case "gpt":
      targetUrl = "/api/generate-title";
      break;
    case "gemini":
    default:
      targetUrl = "/api/generate-title-gem";
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
    console.error("title router error:", err);
    return res.status(500).json({
      error: "AI router failed",
    });
  }
}
