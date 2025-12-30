import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { safeParseJSON } from "./utils/json.js";

export const config = { runtime: "nodejs" };

const EMOTIONS = ["warm", "cool", "dark", "light", "love", "sorrow", "growth"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { poem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // 修正
      generationConfig: {
        temperature: 0.9,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const prompt = `詩を評価し、必ず以下のJSON形式のみで返してください。解説やMarkdownの装飾は一切不要です。\n\n【出力JSON仕様】\n{\n  "score": 0〜100の整数,\n  "emotion": "warm | cool | dark | light | love | sorrow | growth",\n  "comment": "日本語コメント",\n  "titles": ["案1", "案2", "案3"],\n  "tags": ["タグ1", "タグ2"]\n}\n\n【詩】\n${poem}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();

    const parsed = safeParseJSON(raw);
    if (!parsed) {
      return res.status(200).json({ score: null, emotion: "light", comment: "言葉が深く、沈黙を選びました。", titles: [], tags: [] });
    }

    const score = Number.isInteger(parsed.score) ? parsed.score : null;
    const emotion = EMOTIONS.includes(parsed.emotion) ? parsed.emotion : "light";
    const comment = typeof parsed.comment === "string" ? parsed.comment.trim() : "";
    const titles = Array.isArray(parsed.titles) ? parsed.titles.slice(0, 4) : [];
    const tags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [];

    return res.status(200).json({ score, emotion, comment, titles, tags });

  } catch (err) {
    console.error("evaluate-poem error:", err);
    return res.status(500).json({ error: "Failed to evaluate poem" });
  }
}