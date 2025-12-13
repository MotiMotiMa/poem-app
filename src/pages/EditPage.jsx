// =======================================================
// EditPage.jsx（スマホ最適化・loading一元化・完成版）
// =======================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import PoemForm from "../components/PoemForm/PoemForm";
import { loadPoem } from "../supabase/poemApi";

export default function EditPage({ theme, setLoading }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poem, setPoem] = useState(null);

  const isDark = theme === "dark";
  const isMobile = window.innerWidth <= 768;

  const colors = {
    bg: isDark ? "#1c1c1c" : "#f5f5f5",
    card: isDark ? "#2b2b2b" : "#ffffff",
    text: isDark ? "#e8e8e8" : "#2d2d2d",
    border: isDark ? "#444" : "#ccc",
    link: isDark ? "#81c7ff" : "#2980b9",
  };

  // ----------------------------------------------------
  // 詩データ読み込み（親loading使用）
  // ----------------------------------------------------
  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const loaded = await loadPoem(id);
        setPoem(loaded);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [id, setLoading]);

  // ----------------------------------------------------
  // データなし
  // ----------------------------------------------------
  if (!poem) {
    return (
      <div
        style={{
          padding: isMobile ? "1rem" : "2rem",
          color: colors.text,
          background: colors.bg,
          minHeight: "100vh",
        }}
      >
        詩が見つかりません。
      </div>
    );
  }

  // ----------------------------------------------------
  // 通常画面
  // ----------------------------------------------------
  return (
    <div
      style={{
        background: colors.bg,
        minHeight: "100vh",
        padding: isMobile ? "1rem" : "2rem",
        transition: "0.3s ease",
      }}
    >
      {/* 戻る */}
      <div style={{ marginBottom: isMobile ? "1rem" : "1.5rem" }}>
        <Link
          to="/"
          style={{
            color: colors.link,
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "1rem",
          }}
        >
          ← 戻る
        </Link>
      </div>

      {/* 編集カード */}
      <div
        style={{
          maxWidth: isMobile ? "100%" : "500px",
          margin: "0 auto",
          background: colors.card,
          padding: isMobile ? "1.2rem" : "2rem",
          borderRadius: "12px",
          border: `1px solid ${colors.border}`,
          boxShadow: isDark
            ? "0 4px 16px rgba(0,0,0,0.6)"
            : "0 4px 16px rgba(0,0,0,0.15)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: colors.text,
            marginBottom: isMobile ? "1rem" : "1.5rem",
            fontFamily: "'YuMincho', serif",
            fontSize: isMobile ? "1.2rem" : "1.4rem",
          }}
        >
          ✏️ 詩の編集
        </h2>

        <PoemForm
          poemId={id}
          theme={theme}
          setLoading={setLoading}
          onSaved={() => navigate("/")}
        />
      </div>
    </div>
  );
}
