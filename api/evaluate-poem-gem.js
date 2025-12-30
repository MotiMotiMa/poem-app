// =======================================================
// /api/evaluate-poem-gem.js
// Gemini API版：詩を総合評価する唯一のAIエンドポイント（安全第一版）
// =======================================================
import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeParseJSON } from "./utils/json";

export const config = { runtime: "nodejs" };



const EMOTIONS = ["warm", "cool", "dark", "light", "love", "sorrow", "growth"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { poem } = req.body;

    if (!poem || typeof poem !== "string") {
      return res.status(400).json({ error: "Invalid poem" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    // Gemini 初期化
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-pro",
      systemInstruction: `
あなたは日本語の現代詩を扱う編集者です。
あなたは説明しません。
意味を確定しません。
余韻だけを言葉に残します。
`.trim(),
      generationConfig: {
        temperature: 0.9,
      },
    });

    const prompt = `
あなたは詩を評価する批評家ではありません。
読む側に残る余韻を言葉にする編集者です。

【ミッション】
詩の意味を解き明かさず、読後に生じる空気の揺らぎを言葉にしてください。

【絶対制約】
・作者の意図を断定しない
・意味を一つに固定しない
・助言や改善提案をしない
・評価語や分析語を使わない
・命令形を使わない

【表現ルール】
・主語は受け手側に置く
・2〜4文
・比喩は最大1つ
・感情名を直接言わない

【出力JSON仕様】
{
  "score": 0〜100の整数,
  "emotion": "warm | cool | dark | light | love | sorrow | growth",
  "comment": "日本語コメント",
  "titles": [
    "静かな案",
    "動的な案",
    "核語案",
    "攻めすぎ案"
  ],
  "tags": ["名詞中心タグ3〜5個"]
}

【詩】
${poem}
`.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();

    const parsed = safeParseJSON(raw);
    if (!parsed) {
      return res.status(200).json({
        score: null,
        emotion: "light",
        comment: "",
        titles: [],
        tags: [],
      });
    }

    // ----------------------
    // フィルタリング
    // ----------------------
    const score =
      Number.isInteger(parsed.score) &&
      parsed.score >= 0 &&
      parsed.score <= 100
        ? parsed.score
        : null;

    const emotion = EMOTIONS.includes(parsed.emotion)
      ? parsed.emotion
      : "light";

    const comment =
      typeof parsed.comment === "string"
        ? parsed.comment.trim()
        : "";

    const titles = Array.isArray(parsed.titles)
      ? parsed.titles
          .filter(t => typeof t === "string")
          .map(t => t.trim())
          .filter(
            t =>
              t.length > 0 &&
              t.length <= 20 &&
              !/[。．、,.!！?？]/.test(t)
          )
          .slice(0, 4)
      : [];

    const tags = Array.isArray(parsed.tags)
      ? parsed.tags
          .filter(t => typeof t === "string")
          .map(t => t.trim())
          .filter(t => t.length > 0)
          .slice(0, 5)
      : [];

    return res.status(200).json({
      score,
      emotion,
      comment,
      titles,
      tags,
    });

  } catch (err) {
    console.error("evaluate-poem error:", err);
    return res.status(500).json({
      error: "Failed to evaluate poem",
    });
  }
}
