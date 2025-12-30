// =======================================================
// PoemActionBar.jsx
// - 保存
// - AI評価
// - PDF生成
// - AI Provider 切替
// =======================================================

import PoemPDFButton from "./PoemPDFButton";
import AiToggle from "../AiToggle";

export default function PoemActionBar({
  onSave,
  onEvaluate,
  saving,
  user,
  palette,
  isEvaluating,
  poemForPdf,
  aiProvider,
  setAiProvider,
}) {
  return (
    <>
      <div
        style={{
          padding: "0.75rem",
          background: palette.bg2,
          borderRadius: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}
      >
        {/* AI Provider Toggle */}
        <AiToggle
          value={aiProvider}
          onChange={setAiProvider}
          disabled={saving || isEvaluating}
          palette={palette}
        />

        {/* Save */}
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !user}
          style={{
            width: "100%",
            borderRadius: "14px",
            background: palette.main,
            color: "#fff",
            padding: "0.7rem",
            border: "none",
            fontWeight: "bold",
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.9 : 1,
          }}
        >
          {saving ? "保存しています…" : "保存する"}
        </button>

        {/* Evaluate */}
        <button
          type="button"
          onClick={onEvaluate}
          disabled={isEvaluating}
          style={{
            width: "100%",
            borderRadius: "14px",
            background: "transparent",
            border: `1px solid ${palette.border}`,
            color: palette.text,
            padding: "0.6rem",
            cursor: isEvaluating ? "default" : "pointer",
            opacity: isEvaluating ? 0.6 : 1,
          }}
        >
          AI評価
        </button>

        {/* PDF */}
        <PoemPDFButton poem={poemForPdf} palette={palette} />
      </div>

      {/* Evaluating Overlay */}
      {isEvaluating && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.15)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: palette.bg2,
              padding: "1.2rem 1.4rem",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              color: palette.text,
            }}
          >
            <span
              style={{
                width: "18px",
                height: "18px",
                border: `2px solid ${palette.text}`,
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                opacity: 0.6,
              }}
            />
            読後を生成しています
          </div>
        </div>
      )}
    </>
  );
}
