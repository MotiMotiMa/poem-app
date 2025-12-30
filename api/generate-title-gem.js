// /api/generate-title-gem.js (修正版)
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { safeParseJSON } from "./utils/json.js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { poem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // モデル設定の最適化
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // 高速なflashを推奨
      systemInstruction: "あなたは日本語詩の編集者です。題名は余韻だけを残します。",
      generationConfig: {
        temperature: 0.9,
        responseMimeType: "application/json", // JSON出力を強制
      },
      // 詩の表現がブロックされないようセーフティ設定を緩和
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const prompt = `以下の詩に対して、JSON形式で "titles" キーに3つの案を格納して返してください。\n\n【詩】\n${poem}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();

    // --- 修正箇所：変数スコープの修正 ---
    let parsed;
    try {
      parsed = safeParseJSON(raw); // const を外しました
      if (!parsed || !parsed.titles) {
        throw new Error("Invalid structure");
      }
    } catch (e) {
      console.error("Parse Error. Raw:", raw);
      return res.status(200).json({ titles: ["(生成失敗)"] }); // 失敗しても空配列などを返してフロントを落とさない
    }

    return res.status(200).json({
      titles: Array.isArray(parsed.titles) ? parsed.titles : [],
    });

  } catch (err) {
    console.error("generate-title error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}