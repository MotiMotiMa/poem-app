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
    const model = genAI.getGenerativeModel({
      
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.9,
        // 修正ポイント: 旧モデルの場合 responseMimeType が未対応の場合があるため、一旦削除
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    // プロンプトに JSON で返すよう強く指示する（responseMimeType を使わない代わり）
    const prompt = `以下の詩に対して、必ず有効なJSON形式で "titles" キーに3つの案を格納して返してください。余計な解説文は一切不要です。出力はJSONのみにしてください。\n\n【詩】\n${poem}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();

    let parsed = safeParseJSON(raw);
    if (!parsed || !parsed.titles) {
      console.error("JSON Parse Error. Raw:", raw);
      return res.status(200).json({ titles: ["(生成失敗)"] });
    }

    return res.status(200).json({
      titles: Array.isArray(parsed.titles) ? parsed.titles : [],
    });

  } catch (err) {
    console.error("generate-title error:", err);
    return res.status(500).json({ error: "Failed to generate title" });
  }
}