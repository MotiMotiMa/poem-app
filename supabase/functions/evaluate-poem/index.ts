// supabase/functions/evaluate-poem/index.ts
import { OpenAI } from "https://esm.sh/openai@4.52.0";

// CORSヘッダー
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  try {
    // --- プリフライト対応 ---
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "POSTのみ対応しています" }),
        { status: 405, headers: corsHeaders }
      );
    }

    const { title, poemText } = await req.json();

    if (!poemText) {
      return new Response(
        JSON.stringify({ error: "Poem text is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // --- OpenAI Client ---
    const client = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
    });

    // --- GPT へのプロンプト ---
    const prompt = `
あなたは日本語詩の専門編集者です。
以下の詩（題名と本文）を分析し、指定した形式の JSON のみを返してください。

絶対ルール：
- 出力は JSON のみ
- 余計な文章・説明は禁止
- 以下の keys のみを必ず返す
  score（0〜100の整数）
  comment（200文字以内）
  emotion（warm/cool/dark/light/love/sorrow/growth のいずれか）
  titles（必ず3つ）
  tags（3〜6個）

JSONフォーマット：
{
  "score": 0,
  "comment": "",
  "emotion": "",
  "titles": ["", "", ""],
  "tags": ["", "", ""]
}

=== 詩情報 ===
題名: ${title || "（なし）"}
本文:
${poemText}

必ず JSON のみで返してください。
`;

    // --- GPT 呼び出し ---
    const completion = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const content = completion.choices[0].message.content ?? "";

    // --- JSON パース（超安定版）---
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error("JSON parse error:", content);
      result = {
        score: 0,
        comment: "AI解析に失敗しました",
        emotion: "cool",
        titles: [],
        tags: [],
      };
    }

    // --- 正常レスポンス ---
    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (err) {
    console.error("Function Error:", err);
    return new Response(JSON.stringify({ error: "Evaluation failed" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
