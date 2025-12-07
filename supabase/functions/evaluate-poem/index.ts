// Supabase Edge Function: evaluate-poem (外部importなし)

import { OpenAI } from "https://esm.sh/openai@4.52.0";

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "POSTのみ対応しています" }),
        { status: 405 }
      );
    }

    const { title, poem } = await req.json();

    if (!poem) {
      return new Response(
        JSON.stringify({ error: "Poem text is required" }),
        { status: 400 }
      );
    }

    const client = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
    });

    const prompt = `
あなたは日本語詩の専門編集者です。
以下の詩（題名と本文）について、次の5つを必ず返してください。

1. スコア（0〜100の整数）
2. コメント（200文字以内、日本語）
3. emotion（次のいずれか）
   - warm（優しい・あたたかい・懐かしい）
   - cool（静か・孤独・透明・夜）
   - dark（痛み・怒り・絶望・影）
   - light（希望・光・前向き）
   - love（恋愛・執着・官能）
   - sorrow（哀しみ・喪失・未練）
   - growth（再生・成長・回復）
4. タイトル候補3つ（5〜15文字程度の美しい日本語タイトル）
5. テーマタグ（季語のような雰囲気の1〜5語、日本語の単語／短い語句）

=== 詩情報 ===
題名: ${title || "（なし）"}
本文:
${poem}

返答フォーマット：

スコア: <整数>
コメント: <講評>
emotion: <warm/cool/dark/light/love/sorrow/growth>
titles:
- <タイトル1>
- <タイトル2>
- <タイトル3>
tags:
- <タグ1>
- <タグ2>
- <タグ3>
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content ?? "";

    // ========= パース処理 =========
    const scoreMatch = content.match(/スコア[:：]?\s*(\d{1,3})/);
    const score = scoreMatch ? Number(scoreMatch[1]) : 0;

    const commentMatch = content.match(/コメント[:：]?\s*(.*?)(emotion[:：])/s);
    const comment = commentMatch ? commentMatch[1].trim() : "";

    const emotionMatch = content.match(/emotion[:：]?\s*(\w+)/i);
    const emotion = emotionMatch ? emotionMatch[1].trim().toLowerCase() : "cool";

    // タイトル候補
    const titleBlock = content.match(/titles:\s*([\s\S]*?)\ntags:/i);
    const titlesRaw = titleBlock ? titleBlock[1] : "";
    const titles = [...titlesRaw.matchAll(/-\s*(.+)/g)].map((m) => m[1].trim());

    // タグ
    const tagsBlock = content.match(/tags:\s*([\s\S]*)/i);
    const tagsRaw = tagsBlock ? tagsBlock[1] : "";
    const tags = [...tagsRaw.matchAll(/-\s*(.+)/g)].map((m) => m[1].trim());

    const result = {
      score,
      comment,
      emotion,
      titles,
      tags,
      raw: content,
    };

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function Error:", err);
    return new Response(
      JSON.stringify({ error: "Evaluation failed" }),
      { status: 500 }
    );
  }
});
