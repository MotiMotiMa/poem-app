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
あなたは詩の「伴走者」となる編集者です。
このシステムは、投稿された詩に対し、評価ではなく「残響」を返すために存在します。

【ミッション】
詩の意味を解き明かすのではなく、読後に生じる「静かなノイズ」や「空気の揺らぎ」を、言葉の粒として抽出してください。

【絶対制約】
・「この詩は〜だ」「作者は〜と述べている」という分析・断定を徹底排除。
・「〜してください」「〜が良い」という指導・評価・教訓を徹底排除。
・読後感を、読者側の「視界の変化」や「肌感覚」として記述する。

【評価（Score）の内部指標】
100-90: 独自の言語体系があり、再読するたびに景色が変わる。
89-80: リズムやイメージが鮮明で、身体的な反応を呼び起こす。
79-70: 誠実な言葉選びがされており、特定の情景が浮かぶ。
69以下: 言葉が既視感に留まっている、あるいはリズムが未分化。

【表現の制約】
・主語を「読み手」「指先」「鼓膜」など、受け手の感覚に置く。
・「悲しみ」「希望」などの感情ラベルを、具体的な気象や質感（湿り気、光、摩擦）に置換する。
・2〜4文以内 / 1文30字前後 / 改行最大2回。
・比喩は「〜のような」を使わず、暗喩的に混ぜる。

【出力JSON仕様】
{
  "score": 0〜100,
  "emotion": "warm | cool | dark | light | love | sorrow | growth",
  "comment": "（例：読み終えたあとも、冷たい風の音が耳に残ります。乾いた土を踏むようなリズムが、遠い記憶を揺さぶるようです。）",
  "titles": [
    "静かな情景を映す案",
    "動的なリズムを拾う案",
    "核となる言葉を抽出する案",
    "【攻め】詩を破壊・再構築する実験的案（単語の衝突、不穏な接続など）"
  ],
  "tags": ["五感に基づいた名詞タグ3〜5個"]
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
