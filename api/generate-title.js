// =======================================================
// /api/generate-title.js
// 詩から「仮タイトル候補」を生成するAPI（Vercel Serverless）
// - 説明しない
// - 意味を確定しない
// - 余韻だけ拾う
// =======================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { poem } = req.body;

    if (!poem || typeof poem !== "string") {
      return res.status(400).json({ error: "Invalid poem" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "OPENAI_API_KEY not configured" });
    }

    // ---------------------------------------------------
    // プロンプト（タイトル専用・極小責務）
    // ---------------------------------------------------
    const prompt = `
あなたは詩に題名を与える編集者です。

【目的】
詩を説明せず、意味を確定せず、
読後に残る「静かな引っかかり」だけを
短い言葉として切り出してください。

【絶対条件】
・説明文にしない
・感情名を直接書かない
・作者の意図を断定しない
・20文字以内
・記号や句点は使わない
・名詞または名詞句を中心にする

【出力形式】
以下のJSONのみを返すこと。

{
  "titles": [
    "最も静かな案",
    "リズムが残る案",
    "視覚的な案"
  ]
}

【詩】
${poem}
`.trim();

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "あなたは日本語詩の編集者です。題名は余韻だけを残します。",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.9,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;

    if (!raw) {
      throw new Error("Empty AI response");
    }

    // ---------------------------------------------------
    // JSON安全抽出（前後に余計な文字があっても拾う）
    // ---------------------------------------------------
    let parsed;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found");
      parsed = JSON.parse(match[0]);
    } catch (e) {
      console.error("JSON parse failed:", raw);
      throw new Error("Invalid JSON from AI");
    }

    return res.status(200).json({
      titles: Array.isArray(parsed.titles) ? parsed.titles : [],
    });
  } catch (err) {
    console.error("generate-title error:", err);
    return res.status(500).json({ error: "Failed to generate title" });
  }
}
