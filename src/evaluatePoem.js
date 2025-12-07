// src/evaluatePoem.js
export async function evaluatePoem(title, poemText) {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

  if (!supabaseUrl) {
    console.error("エラー: REACT_APP_SUPABASE_URL が設定されていません。");
    return {
      score: 0,
      comment: "評価できませんでした (URL未設定)",
      emotion: "cool",
      titleCandidates: [],
      tags: [],
    };
  }

  const functionUrl = `${supabaseUrl}/functions/v1/evaluate-poem`;

  try {
    console.log("Function URL:", functionUrl);

    const res = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        title: title || "",
        poem: poemText,
      }),
    });

    const data = await res.json();
    console.log("Edge Function応答:", data);

    return {
      score: data.score ?? 0,
      comment: data.comment ?? "",
      emotion: data.emotion || "cool",
      titleCandidates: data.titles || [],
      tags: data.tags || [],
    };
  } catch (err) {
    console.error("AI評価エラー:", err);
    return {
      score: 0,
      comment: "評価できませんでした",
      emotion: "cool",
      titleCandidates: [],
      tags: [],
    };
  }
}
