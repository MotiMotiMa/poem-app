// =======================================================
// /api/generate-title.js
// 詩本文から「通常3案＋攻めすぎ1案」を生成する
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

    // ---------------- emotion別ヒント ----------------
    const emotionHints = {
      light: "日常・気配・静かな光",
      sorrow: "喪失・沈黙・残された痕跡",
      love: "距離・体温・触覚",
      dark: "歪み・不穏・違和感",
      growth: "変化の途中・抜け殻",
    };

    const emotionHint = emotionHints[emotion] || "余白・情景";

    // ---------------- プロンプト（確定） ----------------
    const prompt = `
以下の日本語の詩に対して、タイトル案を4つ生成してください。

【A】通常タイトル（3つ）
・説明的すぎない
・情景や余白を感じさせる
・比喩を優先
・感情トーン：${emotionHint}
・記号や句点は使わない
・20文字以内

【B】攻めすぎタイトル（1つ）
・少し不穏、歪み、違和感があってよい
・美しくなくてよい
・読者が一瞬ためらう語感
・詩の「裏側」をえぐる
・20文字以内

出力形式：
1. （通常）
2. （通常）
3. （通常）
4. （攻めすぎ）

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
              "あなたは日本語詩の編集者です。安全よりも余韻と異物感を重視します。",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.95,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // ---------------- パース ----------------
    const titles = raw
      .split("\n")
      .map((t) => t.replace(/^[\d\-・\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 4);

    return res.status(200).json({
      titles: titles.slice(0, 3),
      risky: titles[3] || null, // ← 攻めすぎ枠
    });
  } catch (err) {
    console.error("generate-title error:", err);
    return res.status(500).json({ error: "Failed to generate title" });
  }
}
