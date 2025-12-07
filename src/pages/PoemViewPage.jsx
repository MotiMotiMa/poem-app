import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import { jsPDF } from "jspdf";

export default function PoemViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poem, setPoem] = useState(null);

  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const colors = {
    bg: isDark ? "#1e1e1e" : "#fafafa",
    card: isDark ? "#2a2a2a" : "#ffffff",
    text: isDark ? "#f1f1f1" : "#2c3e50",
    border: isDark ? "#555" : "#ddd",
    emotion: {
      warm: "#f39c12",
      cool: "#3498db",
      dark: "#8e44ad",
      light: "#2ecc71",
    },
  };

  useEffect(() => {
    const fetchPoem = async () => {
      const { data } = await supabase
        .from("poems")
        .select("*")
        .eq("id", id)
        .single();

      setPoem(data);
    };

    fetchPoem();
  }, [id]);

  if (!poem) {
    return (
      <div
        style={{
          color: colors.text,
          padding: "2rem",
          textAlign: "center",
          fontFamily: "'YuMincho', serif",
        }}
      >
        読み込み中…
      </div>
    );
  }

  // ---------------------------
  //   PDF出力機能
  // ---------------------------
  const generatePDF = () => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let y = 20;

    pdf.setFont("Times", "Normal");

    // タイトル
    pdf.setFontSize(22);
    pdf.text(poem.title || "（無題）", 20, y);
    y += 15;

    // Emotion
    pdf.setFontSize(12);
    pdf.text(`Emotion: ${poem.emotion}`, 20, y);
    y += 8;

    // Tags
    if (poem.tags && poem.tags.length > 0) {
      pdf.text(`Tags: ${poem.tags.join(", ")}`, 20, y);
      y += 10;
    }

    // 本文
    pdf.setFontSize(14);
    const textLines = pdf.splitTextToSize(poem.poem, 170);
    pdf.text(textLines, 20, y);
    y += textLines.length * 7 + 10;

    // Score & Comment
    pdf.setFontSize(12);
    pdf.text(`Score: ${poem.score}`, 20, y);
    y += 7;
    pdf.text(`Comment:`, 20, y);
    y += 7;

    const commentLines = pdf.splitTextToSize(poem.comment, 170);
    pdf.text(commentLines, 20, y);

    // ダウンロード
    pdf.save(`${poem.title || "poem"}.pdf`);
  };

  // ---------------------------
  //   表示
  // ---------------------------
  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        padding: "2rem",
        fontFamily: "'YuMincho', serif",
        color: colors.text,
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          background: colors.card,
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: isDark
            ? "0 4px 14px rgba(0,0,0,0.6)"
            : "0 4px 14px rgba(0,0,0,0.12)",
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* タイトル */}
        <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
          {poem.title || "（無題）"}
        </h1>

        {/* Emotion */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "1.2rem",
            fontWeight: "600",
            color: colors.emotion[poem.emotion] || colors.text,
          }}
        >
          感情テーマ：{poem.emotion}
        </div>

        {/* Tags */}
        {poem.tags && poem.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "1.2rem",
            }}
          >
            {poem.tags.map((tag, i) => (
              <span
                key={i}
                style={{
                  padding: "0.3rem 0.6rem",
                  borderRadius: "6px",
                  background: isDark ? "#444" : "#eee",
                  fontSize: "0.9rem",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 本文 */}
        <div
          style={{
            whiteSpace: "pre-wrap",
            lineHeight: "1.9",
            fontSize: "1.15rem",
            marginBottom: "2rem",
          }}
        >
          {poem.poem}
        </div>

        {/* AIコメント / スコア */}
        <div style={{ opacity: 0.8, marginBottom: "2rem" }}>
          <div>📊 スコア：{poem.score}</div>
          <div style={{ marginTop: "0.4rem" }}>💬 {poem.comment}</div>
        </div>

        {/* ボタン群 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <button
            onClick={() => navigate(`/edit/${poem.id}`)}
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: "8px",
              border: "none",
              background: "#74b9ff",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            編集する
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: "8px",
              border: "none",
              background: "#b2bec3",
              color: "#2d3436",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            一覧へ戻る
          </button>

          <button
            onClick={generatePDF}
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: "8px",
              border: "none",
              background: "#00b894",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            PDFにする
          </button>
        </div>
      </div>
    </div>
  );
}
