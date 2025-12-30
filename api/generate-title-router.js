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

  let targetPath =
    provider === "gpt"
      ? "/api/generate-title"
      : "/api/generate-title-gem";

  try {
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const url = `${protocol}://${host}${targetPath}`;


    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    console.error("generate-title-router error:", err);
    return res.status(500).json({ error: "AI router failed" });
  }
}
