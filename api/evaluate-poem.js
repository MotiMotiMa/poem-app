// =======================================================
// /api/evaluate-poem.js
// 詩を総合評価する唯一のAIエンドポイント（Vercel Serverless）
// - score / emotion / comment / titles / tags を一括返却
// - 通常タイトル3つ + 攻めすぎタイトル1つ
// - 評価コメントは「断定しない編集者文体」固定
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
      return res.status(500).json({ error: "OPENAI_API_KEY not configured" });
    }

    // ---------------------------------------------------
    // プロンプト（磨きフェーズ最終確定）
    // ---------------------------------------------------
    const prompt = `
あなたは詩を評価する批評家ではありません。
読む側に残る余韻を言葉にする編集者です。

このコメントの目的は、
詩を説明することでも、意味を確定することでもなく、
読後に静かに残る感触を言葉にすることです。

【絶対制約】
・作者の意図、心理、背景を断定しない
・作品の意味を一つに固定しない
・助言、改善提案、教訓を含めない
・診断、評価、分析をしない
・「この詩は〜だ」という断定構文を使わない

【表現ルール】
・主語は「読む側」「読後」「〜と感じられる」など読者側に置く
・2〜4文以内
・1文は30文字前後
・改行は最大2回まで
・比喩は最大1つまで
・感情名（悲しい・嬉しい等）を直接言わない
・抽象語の連続使用を避ける

【トーン】
・断定しない
・押し付けない
・余白を残す
・詩より前に出ない

【確認】
以下をすべて満たす場合のみ出力する：
1. 読み手が「そうかもしれない」と逃げられる
2. 作者の解釈を奪っていない
3. 消しても作品は成立する
4. しかし、あると少し静かになる

【出力JSON仕様】
{
  "score": 0〜100の整数,
  "emotion": "warm | cool | dark | light | love | sorrow | growth",
  "comment": "上記条件をすべて満たした日本語コメント",
  "titles": [
    "通常タイトル案1",
    "通常タイトル案2",
    "通常タイトル案3",
    "攻めすぎタイトル案（挑発的・実験的）"
  ],
  "tags": ["名詞中心の短い日本語タグを3〜5個"]
}

【タイトル制約】
・20文字以内
・記号や句点は使わない
・説明的すぎない
・4つ目は明確に“攻めすぎ”でよい

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
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "あなたは日本語詩の編集者です。余白、リズム、情景を最優先します。",
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
    // JSON安全パース
    // ---------------------------------------------------
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("JSON parse failed:", raw);
      throw new Error("Invalid JSON from AI");
    }

    return res.status(200).json({
      score: parsed.score ?? null,
      emotion: parsed.emotion ?? "light",
      comment: parsed.comment ?? "",
      titles: Array.isArray(parsed.titles) ? parsed.titles : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    });
  } catch (err) {
    console.error("evaluate-poem error:", err);
    return res.status(500).json({ error: "Failed to evaluate poem" });
  }
}
