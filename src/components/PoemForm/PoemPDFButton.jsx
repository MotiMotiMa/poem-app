// =======================================================
// PoemPDFButton.jsx（単体PDF対応：year必須仕様に追従）
// =======================================================

import { generatePoemBookPDF } from "../../utils/PoemBookPDF";

export default function PoemPDFButton({
  title,
  poem,
  emotion,
  score,
  tags,
  palette,
}) {
  const handleClick = () => {
    const now = new Date();
    const year = now.getFullYear();

    generatePoemBookPDF(
      [
        {
          title,
          poem,
          emotion,
          score,
          tags,
          created_at: now.toISOString(), // ★ 年フィルタに落ちないように付与
        },
      ],
      year
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        marginTop: "0.4rem",
        background: "none",
        border: "none",
        color: palette.text,
        opacity: 0.4,
        fontSize: "0.75rem",
        cursor: "pointer",
        padding: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.4)}
    >
      PDFとして残す
    </button>
  );
}
