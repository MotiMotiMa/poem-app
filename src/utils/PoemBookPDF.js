import { jsPDF } from "jspdf";

export function generatePoemBookPDF(poems) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let y = 20;

  // -------------------------------
  // ① 表紙ページ
  // -------------------------------
  pdf.setFont("Times", "Normal");
  pdf.setFontSize(28);
  pdf.text("Poem Collection", 20, y);
  y += 15;

  pdf.setFontSize(14);
  pdf.text(`Total Poems: ${poems.length}`, 20, y);
  y += 20;

  pdf.setFontSize(12);
  pdf.text(
    "Generated automatically by Poem App.",
    20,
    y
  );

  // 次のページへ
  pdf.addPage();

  // -------------------------------
  // ② 各詩ページ
  // -------------------------------
  poems.forEach((poem, index) => {
    let y = 20;

    // タイトル
    pdf.setFontSize(20);
    pdf.text(poem.title || "（無題）", 20, y);
    y += 15;

    // Emotion
    if (poem.emotion) {
      pdf.setFontSize(12);
      pdf.text(`Emotion: ${poem.emotion}`, 20, y);
      y += 7;
    }

    // Tags
    if (poem.tags && poem.tags.length > 0) {
      pdf.setFontSize(12);
      pdf.text(`Tags: ${poem.tags.join(", ")}`, 20, y);
      y += 10;
    }

    // 本文
    pdf.setFontSize(14);
    const poemLines = pdf.splitTextToSize(poem.poem, 170);
    pdf.text(poemLines, 20, y);
    y += poemLines.length * 7 + 10;

    // AIスコア
    pdf.setFontSize(12);
    pdf.text(`Score: ${poem.score}`, 20, y);
    y += 7;

    // AIコメント
    const commentLines = pdf.splitTextToSize(poem.comment || "", 170);
    pdf.text(commentLines, 20, y);

    // 最後じゃなければ次ページ
    if (index < poems.length - 1) {
      pdf.addPage();
    }
  });

  pdf.save("Poem_Collection.pdf");
}
