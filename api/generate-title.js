// =======================================================
// /api/generate-title.js
// 詩本文からタイトル候補を生成する（Vercel Serverless）
// =======================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { poem, emotion } = req.body;

    if (!poem || typeof poem !== "string") {
      return res.status(400).json({ error: "Invalid poem" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    // ---- プロンプト設計（確定版） ----
    const prompt = `
以下の日本語の詩に対して、
「説明的すぎない」「情景や余白を感じさせる」
短い日本語タイトル案を3つ提案してください。

制約：
・比喩や余韻を優先
・感情トーン：${emotion}
・記号や句点は使わない
・各タイトルは20文字以内

詩：
${poem}
`.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "あなたは日本語詩の編集者です。余白と余韻を大切にします。",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // ---- パース（安全寄り） ----
    const titles = raw
      .split("\n")
      .map((t) => t.replace(/^[\d\-・\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    return res.status(200).json({ titles });
  } catch (err) {
    console.error("generate-title error:", err);
    return res.status(500).json({ error: "Failed to generate title" });
  }
}
