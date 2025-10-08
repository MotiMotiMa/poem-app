export async function evaluatePoem(poemText) {
  // 環境変数からSupabase URLを取得
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

  // URLが設定されていない場合はエラーをスロー
  if (!supabaseUrl) {
    console.error("エラー: REACT_APP_SUPABASE_URL が設定されていません。");
    return { score: 0, comment: "評価できませんでした (URL未設定)" };
  }

  // 評価関数のエンドポイントを動的に構築
  const functionUrl = `${supabaseUrl}/functions/v1/evaluate-poem`;

  try {
    console.log("Supabase anon key:", process.env.REACT_APP_SUPABASE_ANON_KEY);
    console.log("Function URL:", functionUrl); // デバッグ用にURLを出力

    const res = await fetch(
      functionUrl, // 💡 動的なURLを使用
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // anon key を付与
          "Authorization": `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ poem: poemText }),
      }
    );

    const data = await res.json();
    console.log("Edge Function応答:", data);

    const content = data?.content || "";

    // GPTの応答からスコアとコメントを抽出するロジックは変更なし
    const scoreMatch = content.match(/スコア[:：]?\s*(\d{1,3})/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    const commentMatch = content.match(/コメント[:：]?\s*(.*)/s);
    const comment = commentMatch ? commentMatch[1].trim() : content;

    return { score, comment };
  } catch (err) {
    console.error("AI評価エラー:", err);
    return { score: 0, comment: "評価できませんでした" };
  }
}