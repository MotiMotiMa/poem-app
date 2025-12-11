// =======================================================
// EditPage.jsx（API統合・theme完全対応・軽量版）
// =======================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import PoemForm from "../components/PoemForm/PoemForm";
import { loadPoem, savePoem } from "../supabase/poemApi";

export default function EditPage({ theme, setLoading }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poem, setPoem] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const isDark = theme === "dark";

  const colors = {
    bg: isDark ? "#1c1c1c" : "#f5f5f5",
    card: isDark ? "#2b2b2b" : "#ffffff",
    text: isDark ? "#e8e8e8" : "#2d2d2d",
    border: isDark ? "#444" : "#ccc",
    link: isDark ? "#81c7ff" : "#2980b9",
  };

  // ----------------------------------------------------
  // 詩データ読み込み（API）
  // ----------------------------------------------------
  useEffect(() => {
    async function fetch() {
      setPageLoading(true);

      const loaded = await loadPoem(id);
      setPoem(loaded);

      setPageLoading(false);
    }

    fetch();
  }, [id]);

  // ----------------------------------------------------
  // 保存処理（API 呼び出し）
  // ----------------------------------------------------
  const handleSave = async (data) => {
    setLoading(true);

    await savePoem(id, data);

    setLoading(false);
    navigate("/");
  };

  // ----------------------------------------------------
  // ページロード中
  // ----------------------------------------------------
  if (pageLoading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: colors.bg,
          color: colors.text,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "6px solid #888",
            borderTop: "6px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // ----------------------------------------------------
  // データなし
  // ----------------------------------------------------
  if (!poem) {
    return (
      <div
        style={{
          padding: "2rem",
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
        padding: "2rem",
        transition: "0.3s ease",
      }}
    >
      {/* 戻るリンク */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          to="/"
          style={{
            color: colors.link,
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          ← 戻る
        </Link>
      </div>

      {/* カード中央 */}
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          background: colors.card,
          padding: "2rem",
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
            marginBottom: "1.5rem",
            fontFamily: "'YuMincho', serif",
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
