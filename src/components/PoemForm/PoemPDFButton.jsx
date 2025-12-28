// =======================================================
// PoemPDFButton.jsx
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
  return (
    <button
      type="button"
      onClick={() =>
        generatePoemBookPDF([
          {
            title,
            poem,
            emotion,
            score,
            tags,
          },
        ])
      }
      style={{
        marginTop: "1rem",
        background: "none",
        border: "none",
        color: palette.text,
        opacity: 0.4,
        fontSize: "0.75rem",
        cursor: "pointer",
        padding: 0,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = 0.7)}
      onMouseLeave={e => (e.currentTarget.style.opacity = 0.4)}
    >
      PDFとして残す
    </button>
  );
}
