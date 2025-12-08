import jsPDF from "jspdf";
import fontData from "../fonts/NotoSansJP-VariableFont_wght-normal.js";

// フォント登録
function registerFont(pdf) {
  pdf.addFileToVFS("NotoSansJP.ttf", fontData);
  pdf.addFont("NotoSansJP.ttf", "NotoSansJP", "normal");
}

export function generatePoemBookPDF(poems) {
  const pdf = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  registerFont(pdf);
  pdf.setFont("NotoSansJP");

  const lineHeight = 20;
  const margin = 50;
  let y = margin;

  poems.forEach((p, index) => {
    if (index !== 0) pdf.addPage();

    pdf.setFontSize(18);
    pdf.text(p.title || "（無題）", margin, y);
    y += 30;

    pdf.setFontSize(12);

    const lines = pdf.splitTextToSize(p.poem || "", 500);
    lines.forEach((line) => {
      pdf.text(line, margin, y);
      y += lineHeight;
    });

    y += 20;
    pdf.setFontSize(10);

    pdf.text(`emotion: ${p.emotion || ""}`, margin, y);
    y += lineHeight;
    pdf.text(`score: ${p.score || ""}`, margin, y);
    y += lineHeight;

    if (p.tags && p.tags.length > 0) {
      pdf.text(`tags: ${p.tags.join(", ")}`, margin, y);
    }

    y = margin;
  });

  pdf.save("Poem_Collection.pdf");
}
