/* C:\Users\PC_User\poem-app\src\ai\rewritePoem.js */

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

export async function rewritePoem(originalText) {
  const prompt = `
詩を4つの方向性でリライトしてください。
各バージョンは本文のみを返し、タイトルは付けないこと。

【方向性】
1. warm（優しさ・救い）
2. cool（静けさ・冷たさ）
3. dark（苦しみ・影）
4. light-short（光を強めた短詩・10～40字）

【元の詩】
${originalText}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-5.1",
    messages: [
      { role: "system", content: "あなたは詩のリライト専門家です。" },
      { role: "user", content: prompt },
    ],
  });

  const text = completion.choices[0].message.content;

  const parts = text.split(/\n-{3,}\n/);

  return {
    warm: parts[0]?.trim() || "",
    cool: parts[1]?.trim() || "",
    dark: parts[2]?.trim() || "",
    light: parts[3]?.trim() || "",
  };
}
