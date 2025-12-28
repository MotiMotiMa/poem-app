// =======================================================
// PoemBookPDF.js
// - 単体PDF生成（generateSinglePoemPDF）
// - 年単位PDF生成（generateYearPoemBookPDF）
// - 年サブタイトル自動生成（感情軸ベース）
// - 日本語完全対応
// =======================================================

import jsPDF from "jspdf";
import { NotoSansJPRegular } from "../assets/fonts/NotoSansJP-Regular.base64";

// =======================================================
// エモーショナル軸（確定）
// =======================================================
const EMOTIONAL_AXES = {
  Light: ["光", "明", "白", "晴", "朝"],
  Dark: ["闇", "影", "夜", "黒", "沈"],
  Warm: ["温", "暖", "ぬく", "熱", "息"],
  Cool: ["冷", "寒", "氷", "静", "澄"],
  Love: ["愛", "君", "手", "声", "体"],
  Sorrow: ["哀", "悲", "涙", "別", "失"],
  Growth: ["芽", "育", "伸", "始", "生"],
};

// =======================================================
// 年サブタイトル自動生成
// =======================================================
function generateYearSubtitle(poems) {
  const text = poems
    .map(p => `${p.title || ""} ${p.poem || ""}`)
    .join(" ");

  const score = {};

  Object.entries(EMOTIONAL_AXES).forEach(([axis, words]) => {
    score[axis] = 0;
    words.forEach(w => {
      if (text.includes(w)) score[axis] += 1;
    });
  });

  const ranked = Object.entries(score)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  if (ranked.length >= 2) {
    return `── ${ranked[0][0]} / ${ranked[1][0]} ──`;
  }
  if (ranked.length === 1) {
    return `── ${ranked[0][0]} ──`;
  }
  return `── ${poems.length} poems ──`;
}

// =======================================================
// ★ 単体PDF生成
// =======================================================
export function generateSinglePoemPDF(poem) {
  if (!poem?.poem) return;

  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  // 日本語フォント
  pdf.addFileToVFS("NotoSansJP-Regular.ttf", NotoSansJPRegular);
  pdf.addFont("NotoSansJP-Regular.ttf", "NotoJP", "normal");
  pdf.setFont("NotoJP", "normal");

  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 30;

  // タイトル
  pdf.setFontSize(18);
  pdf.text(poem.title || "（無題）", pageWidth / 2, y, {
    align: "center",
  });
  y += 15;

  // 本文
  pdf.setFontSize(11);
  const body = pdf.splitTextToSize(poem.poem, pageWidth - 40);
  pdf.text(body, 20, y);

  const now = new Date();
  const fileName = `poem-${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.pdf`;

  pdf.save(fileName);
}

// =======================================================
// ★ 年単位PDF生成
// =======================================================
export function generateYearPoemBookPDF(poems = [], year) {
  if (!poems.length || !year) return;

  const yearPoems = poems.filter(p => {
    if (!p.created_at) return false;
    return new Date(p.created_at).getFullYear() === year;
  });

  if (!yearPoems.length) return;

  const sortedPoems = [...yearPoems].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  // 日本語フォント
  pdf.addFileToVFS("NotoSansJP-Regular.ttf", NotoSansJPRegular);
  pdf.addFont("NotoSansJP-Regular.ttf", "NotoJP", "normal");
  pdf.setFont("NotoJP", "normal");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // 表紙
  pdf.setFontSize(22);
  pdf.text("Poem Book", pageWidth / 2, pageHeight / 2 - 24, {
    align: "center",
  });

  const subtitle = generateYearSubtitle(sortedPoems);
  pdf.setFontSize(11);
  pdf.text(subtitle, pageWidth / 2, pageHeight / 2 - 10, {
    align: "center",
  });

  pdf.setFontSize(12);
  pdf.text(`${year}`, pageWidth / 2, pageHeight / 2 + 10, {
    align: "center",
  });

  // 本文
  sortedPoems.forEach(p => {
    pdf.addPage();
    let y = 25;

    pdf.setFontSize(16);
    pdf.text(p.title || "（無題）", 20, y);
    y += 7;

    if (p.created_at) {
      const d = new Date(p.created_at);
      const dateLabel = `${d.getFullYear()}.${String(
        d.getMonth() + 1
      ).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
      pdf.setFontSize(9);
      pdf.text(dateLabel, 20, y);
      y += 6;
    }

    pdf.setFontSize(11);
    const body = pdf.splitTextToSize(p.poem || "", pageWidth - 40);
    pdf.text(body, 20, y);
  });

  pdf.save(`poems-${year}.pdf`);
}
