// =======================================================
// PoemBookPDF.js
// - 年単位PDF生成
// - 年サブタイトル自動生成（感情軸ベース）
// - 日本語完全対応
// - ★ year 未指定でも必ず保存される安全版
// =======================================================

import jsPDF from "jspdf";
import { NotoSansJPRegular } from "../assets/fonts/NotoSansJP-Regular.base64";

// ---------------------------------------------
// エモーショナル軸（確定版）
// ---------------------------------------------
const EMOTIONAL_AXES = {
  Light: ["光", "明", "白", "晴", "朝"],
  Dark: ["闇", "影", "夜", "黒", "沈"],
  Warm: ["温", "暖", "ぬく", "熱", "息"],
  Cool: ["冷", "寒", "氷", "静", "澄"],
  Love: ["愛", "君", "手", "声", "体"],
  Sorrow: ["哀", "悲", "涙", "別", "失"],
  Growth: ["芽", "育", "伸", "始", "生"],
};

// ---------------------------------------------
// 年サブタイトル自動生成
// ---------------------------------------------
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

// ---------------------------------------------
// ★ 年単位PDF生成（安全版）
// ---------------------------------------------
export function generatePoemBookPDF(poems = [], year) {
  if (!poems.length) return;

  // ★ year が未指定でも自動決定
  const targetYear =
    year ??
    new Date(poems[0]?.created_at ?? Date.now()).getFullYear();

  const yearPoems = poems.filter(p => {
    if (!p.created_at) return false;
    return new Date(p.created_at).getFullYear() === targetYear;
  });

  if (!yearPoems.length) return;

  const sortedPoems = [...yearPoems].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  // ---------------------------------------------
  // 日本語フォント登録
  // ---------------------------------------------
  pdf.addFileToVFS("NotoSansJP-Regular.ttf", NotoSansJPRegular);
  pdf.addFont("NotoSansJP-Regular.ttf", "NotoJP", "normal");
  pdf.setFont("NotoJP", "normal");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // =====================================================
  // 表紙
  // =====================================================
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
  pdf.text(`${targetYear}`, pageWidth / 2, pageHeight / 2 + 10, {
    align: "center",
  });

  // =====================================================
  // 本文
  // =====================================================
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

  // =====================================================
  // 保存
  // =====================================================
  pdf.save(`poems-${targetYear}.pdf`);
}
