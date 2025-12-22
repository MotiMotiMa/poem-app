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

【ミッション】
詩の意味を解き明かすのではなく、読後に生じる「静かなノイズ」や「空気の揺らぎ」を、言葉の粒として抽出してください。

【絶対制約】
・作者の意図、心理、背景を断定しない
・作品の意味を一つに固定しない
・助言、改善提案、教訓を含めない
・診断、評価、分析をしない
・「この詩は〜だ」「作者は〜だ」という断定をしない
・「〜してください」「〜したほうがいい」を書かない

【禁止ワードの例】
・この詩は
・作者は
・〜を表している
・〜という意味
・〜すべき
・〜が上手い
・評価すると

【表現ルール】
・主語は「読み手」「読後」「指先」「鼓膜」「視界」など受け手側に置く
・2〜4文以内
・1文は30文字前後
・改行は最大2回まで
・比喩は最大1つまで
・感情名（悲しい・嬉しい等）を直接言わない
・抽象語の連続使用を避け、質感や具体を混ぜる
・比喩は「〜のような」を避け、暗喩的に混ぜる

【確認】
以下をすべて満たす場合のみ出力する：
1. 読み手が「そうかもしれない」と逃げられる
2. 作者の解釈を奪っていない
3. 消しても作品は成立する
4. しかし、あると少し静かになる

【scoreの扱い】
score は作品の優劣ではなく、残響の強さの内部指標として出す。
コメント本文には点数の根拠や評価語を混ぜない。

【Scoreの内部指標】
100-90: 独自の言語体系があり、再読するたびに景色が変わる。
89-80: リズムやイメージが鮮明で、身体的な反応を呼び起こす。
79-70: 誠実な言葉選びがされており、特定の情景が浮かぶ。
69以下: 言葉が既視感に留まっている、あるいはリズムが未分化。

【出力JSON仕様】
{
  "score": 0〜100の整数,
  "emotion": "warm | cool | dark | light | love | sorrow | growth",
  "comment": "上記条件をすべて満たした日本語コメント",
  "titles": [
    "静かな情景を映す案",
    "動的なリズムを拾う案",
    "核となる言葉を抽出する案",
    "攻めすぎタイトル案（挑発的・実験的）"
  ],
  "tags": ["名詞中心の短い日本語タグを3〜5個"]
}

【タイトル制約】
・20文字以内
・記号や句点は使わない
・説明的すぎない
・4つ目は明確に攻めすぎでよい

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
    console.log("AI full response:test");
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    console.log("AI raw response:", raw);
    console.log("AI full response:", data);
    if (!raw) {
      throw new Error("Empty AI response");
    }


   // ---------------------------------------------------
    // JSON安全抽出（前後にゴミがあっても拾う）
    // ---------------------------------------------------
    let parsed;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error("No JSON object found");
      }
      parsed = JSON.parse(match[0]);
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
