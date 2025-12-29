// components/PoemForm/PoemPDFButton.jsx
import { generateSinglePoemPDF } from "../../utils/PoemBookPDF";

export default function PoemPDFButton({ poem }) {
  return (
    <button
      type="button"
      onClick={() => generateSinglePoemPDF(poem)}
      style={{
        background: "none",
        border: "none",
        opacity: 0.5,
        fontSize: "0.75rem",
        cursor: "pointer",
      }}
    >
      PDFとして残す
    </button>
  );
}
