const fs = require("fs");
const path = require("path");

const fontPath = path.resolve(
  __dirname,
  "../src/assets/fonts/NotoSansJP-Regular.ttf"
);

const outputPath = path.resolve(
  __dirname,
  "../src/assets/fonts/NotoSansJP-Regular.base64.js"
);

const fontData = fs.readFileSync(fontPath);
const base64 = fontData.toString("base64");

const content = `// 自動生成：Noto Sans JP Regular
export const NotoSansJPRegular = "${base64}";
`;

fs.writeFileSync(outputPath, content);

console.log("Base64 font generated.");
