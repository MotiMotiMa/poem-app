// src/hooks/useSavePoem.jsx
import { useState } from "react";
import supabase from "../supabaseClient";

export default function useSavePoem({ refresh, setTitleCandidates, setEditingPoem }) {
  const [saving, setSaving] = useState(false);

  // ============================================================
  // ⚡ 精度強化版：emotion自動判定ロジック（軽量高速＋高精度）
  // ============================================================
  async function autoDetectEmotion(poemText) {
    try {
      const prompt = `
以下の詩の「中心となる感情テーマ」を1つだけ返してください。
該当しうる候補は次の7つです：

- warm（優しい・懐かしい・救い）
- cool（静けさ・距離・孤独）
- dark（苦しみ・影・内面的闇）
- light（希望・前向き・再生）
- love（恋・欲望・執着・情熱）
- sorrow（喪失・痛み・悲しみ）
- growth（変化・解放・覚醒）

判定ルール：
1. 「恋愛的な痛み」がテーマ → love ではなく sorrow を優先
2. 「依存・執着・身体性」が強い → love を優先
3. 「孤独・静寂・冷たい風景」→ cool
4. 「苦しさ・黒いイメージ・重さ」→ dark
5. 「前を向いている・回復」→ light または growth
6. もっとも強く現れている感情を1つ選ぶ
7. 単語ひとつだけで返答してください

詩：
${poemText}
`;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 8,
        }),
      });

      const data = await res.json();
      const output = data.choices?.[0]?.message?.content?.trim().toLowerCase();

      const allowed = ["warm", "cool", "dark", "light", "love", "sorrow", "growth"];
      if (allowed.includes(output)) return output;

      // fallback
      return "cool";
    } catch (err) {
      console.error("emotion 自動判定エラー:", err);
      return "cool";
    }
  }

  // ============================================================
  // 保存処理（新規・更新共通）
  // ============================================================
  async function savePoem(poemData, editingPoem) {
    setSaving(true);

    let finalEmotion = poemData.emotion;

    // emotion=auto → 自動判定へ
    if (poemData.emotion === "auto") {
      finalEmotion = await autoDetectEmotion(poemData.poem);
    }

    const payload = {
      title: poemData.title,
      poem: poemData.poem,
      emotion: finalEmotion,
      tags: poemData.tags,
    };

    let result;
    if (editingPoem?.id) {
      result = await supabase
        .from("poems")
        .update(payload)
        .eq("id", editingPoem.id);
    } else {
      result = await supabase.from("poems").insert(payload);
    }

    if (result.error) {
      console.error("保存エラー:", result.error);
    }

    await refresh();
    if (setEditingPoem) setEditingPoem(null);

    setSaving(false);
  }

  return { savePoem, saving };
}
