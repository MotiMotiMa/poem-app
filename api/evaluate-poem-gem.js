// =======================================================
// /api/evaluate-poem-gem.js
// Gemini API版：詩を総合評価する唯一のAIエンドポイント
// =======================================================
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; // 修正1: インポート追加
import { safeParseJSON } from "./utils/json.js";

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

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", 
      systemInstruction: `あなたは日本語の現代詩を扱う編集者です。説明せず、余韻だけを言葉に残します。`.trim(),
      generationConfig: {
        temperature: 0.9,
        responseMimeType: "application/json",
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const prompt = `
あなたは詩を評価する批評家ではなく、読後に生じる空気の揺らぎを言葉にする編集者です。

【出力JSON仕様】
{
  "score": 0〜100の整数,
  "emotion": "warm | cool | dark | light | love | sorrow | growth",
  "comment": "日本語コメント",
  "titles": ["案1", "案2", "案3"],
  "tags": ["タグ1", "タグ2"]
}

【詩】
${poem}
`.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();

    let parsed;
    try {
      parsed = safeParseJSON(raw); 
      if (!parsed) throw new Error("Invalid JSON from Gemini");
    } catch (e) {
      console.error("JSON parse failed:", raw);
      // パース失敗時のフォールバック
      return res.status(200).json({
        score: null,
        emotion: "light",
        comment: "言葉が深く、沈黙を選びました。",
        titles: [],
        tags: [],
      });
    }

    // --- 修正2: ここにあった return res.status(200).json({titles: ...}) を削除しました ---

    // ----------------------
    // フィルタリングと整形
    // ----------------------
    const score = Number.isInteger(parsed.score) && parsed.score >= 0 && parsed.score <= 100
        ? parsed.score
        : null;

    const emotion = EMOTIONS.includes(parsed.emotion) ? parsed.emotion : "light";

    const comment = typeof parsed.comment === "string" ? parsed.comment.trim() : "";

    const titles = Array.isArray(parsed.titles)
      ? parsed.titles
          .filter(t => typeof t === "string")
          .map(t => t.trim())
          .filter(t => t.length > 0 && t.length <= 20 && !/[。．、,.!！?？]/.test(t))
          .slice(0, 4)
      : [];

    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.filter(t => typeof t === "string").map(t => t.trim()).filter(t => t.length > 0).slice(0, 5)
      : [];

    // 最終的な評価データをすべて返す
    return res.status(200).json({
      score,
      emotion,
      comment,
      titles,
      tags,
    });

  } catch (err) {
    console.error("evaluate-poem error:", err);
    return res.status(500).json({ error: "Failed to evaluate poem" });
  }
}