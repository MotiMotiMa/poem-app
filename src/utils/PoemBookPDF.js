// =======================================================
// PoemBookPDF.js
// =======================================================

import jsPDF from "jspdf";

export function generatePoemBookPDF(poems = []) {
  if (!poems.length) return;

  // ---------------------------------------------
  // 日付（PDF名用）
  // ---------------------------------------------
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const fileName = `poems-${year}-${month}.pdf`;

  // ---------------------------------------------
  // 時系列順に並び替え（古い → 新しい）
  // created_at がなければ配列順を信用
  // ---------------------------------------------
  const sortedPoems = [...poems].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0;
    return new Date(a.created_at) - new Date(b.created_at);
  });

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // =====================================================
  // 表紙ページ
  // =====================================================
  pdf.setFontSize(20);
  pdf.text("Poem Book", pageWidth / 2, pageHeight / 2 - 10, {
    align: "center",
  });

  pdf.setFontSize(12);
  pdf.text(
    `${year}.${month}`,
    pageWidth / 2,
    pageHeight / 2 + 10,
    { align: "center" }
  );

  // =====================================================
  // 本文ページ
  // =====================================================
  sortedPoems.forEach((p, index) => {
    pdf.addPage();

    let y = 25;

    // タイトル
    pdf.setFontSize(16);
    pdf.text(p.title || "（無題）", 20, y);
    y += 10;

    // 本文
    pdf.setFontSize(11);
    const body = pdf.splitTextToSize(p.poem || "", pageWidth - 40);
    pdf.text(body, 20, y);
  });

  pdf.save(fileName);
}
