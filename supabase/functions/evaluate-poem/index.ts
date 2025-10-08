// supabase/functions/evaluate-poem/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// 💡 CORSヘッダーを定義（修正箇所）
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://poem-app-blond.vercel.app', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  try {
    // OPTIONSメソッドでCORSヘッダーを返す
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const { poem } = await req.json();

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`, // Supabase Secret
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
あなたは詩の批評家です。
必ず次の形式で返答してください:

スコア: [0〜100の整数]
コメント: [短い講評]
            `,
          },
          { role: "user", content: poem },
        ],
      }),
    });

   const data = await resp.json();
   console.log("OpenAIレスポンス:", JSON.stringify(data));

    // 正常系: content があれば返す
    const content = data?.choices?.[0]?.message?.content;
    if (content) {
      return new Response(
        JSON.stringify({ content }),
        // 💡 ヘッダーを正しくマージ（修正箇所：スプレッド演算子 ... を使用）
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // エラー系: OpenAIからエラーオブジェクトが来た場合
    return new Response(
      JSON.stringify({ error: data }),
      // 💡 ヘッダーを正しくマージ（修正箇所）
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      // 💡 ヘッダーを正しくマージ（修正箇所）
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});