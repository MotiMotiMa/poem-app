// =======================================================
// /api/generate-title-gem.js
// Gemini API版：詩から「仮タイトル候補」を生成するAPI
// =======================================================
import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeParseJSON } from "./utils/json";

export const config = { runtime: "nodejs" };

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
    
    // タイトル生成は軽量な gemini-1.5-flash で十分高速・高品質に動作します
    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-pro",
      systemInstruction: "あなたは日本語詩の編集者です。題名は余韻だけを残します。",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.9,
      },
    });

    const prompt = `
あなたは詩に題名を与える編集者です。

【目的】
詩を説明せず、意味を確定せず、読後に残る「静かな引っかかり」だけを短い言葉として切り出してください。

【絶対条件】
・説明文にしない
・感情名を直接書かない
・作者の意図を断定しない
・20文字以内
・記号や句点は使わない
・名詞または名詞句を中心にする

【出力形式】
JSON形式で "titles" キーに3つの案を格納して返してください。

【詩】
${poem}
`.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();

    let parsed;
    try {
      const parsed = safeParseJSON(raw);
      if (!parsed) {
        throw new Error("Invalid JSON from Gemini");
      }
    } catch (e) {
      console.error("JSON parse failed:", raw);
      throw new Error("Invalid JSON from Gemini");
    }

    return res.status(200).json({
      titles: Array.isArray(parsed.titles) ? parsed.titles : [],
    });

  } catch (err) {
    console.error("generate-title error:", err);
    return res.status(500).json({ error: "Failed to generate title" });
  }
}