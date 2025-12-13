// =======================================================
// PoemViewPage.jsx（スマホ最適化・loading一元化・完成版）
// =======================================================

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import supabase from "../supabaseClient";
import TagPill from "../components/TagPill";

export default function PoemViewPage({ theme, setLoading }) {
  const { id } = useParams();
  const [poem, setPoem] = useState(null);

  const isDark = theme === "dark";
  const isMobile = window.innerWidth <= 768;

  const colors = {
    bg: isDark ? "#1d1d1d" : "#f4f4f4",
    card: isDark ? "#2b2b2b" : "#ffffff",
    text: isDark ? "#eeeeee" : "#222222",
    border: isDark ? "#444" : "#ccc",
    link: isDark ? "#81c7ff" : "#1e88e5",
  };

  // ----------------------------------------------------
  // 詩を取得（App.js の loading を使用）
  // ----------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("poems")
          .select("*")
          .eq("id", id)
          .single();

        if (!error) {
          setPoem(data);
        } else {
          setPoem(null);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, setLoading]);

  // ----------------------------------------------------
  // データなし
  // ----------------------------------------------------
  if (!poem) {
    return (
      <div
        style={{
          background: colors.bg,
          color: colors.text,
          minHeight: "100vh",
          padding: isMobile ? "1rem" : "2rem",
        }}
      >
        詩が見つかりません。
      </div>
    );
  }

  // ----------------------------------------------------
  // 表示
  // ----------------------------------------------------
  return (
    <div
      style={{
        background: colors.bg,
        minHeight: "100vh",
        padding: isMobile ? "1rem" : "2rem",
        color: colors.text,
        fontFamily: "'YuMincho', serif",
      }}
    >
      {/* 戻る */}
      <div style={{ marginBottom: isMobile ? "1rem" : "1.5rem" }}>
        <Link
          to="/"
          style={{
            color: colors.link,
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "600",
          }}
        >
          ← 戻る
        </Link>
      </div>

      {/* カード */}
      <div
        style={{
          maxWidth: isMobile ? "100%" : "600px",
          margin: "0 auto",
          padding: isMobile ? "1.2rem" : "2rem",
          background: colors.card,
          borderRadius: "12px",
          border: `1px solid ${colors.border}`,
          boxShadow: isDark
            ? "0 4px 16px rgba(0,0,0,0.6)"
            : "0 4px 16px rgba(0,0,0,0.15)",
          color: colors.text,
        }}
      >
        {/* タイトル */}
        <h2
          style={{
            textAlign: "center",
            marginBottom: "1rem",
            lineHeight: "1.5",
            fontSize: isMobile ? "1.2rem" : "1.4rem",
          }}
        >
          {poem.title}
        </h2>

        {/* スコア */}
        <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
          <span
            style={{
              display: "inline-block",
              padding: "0.3rem 0.8rem",
              borderRadius: "12px",
              background: isDark ? "#333" : "#e0e0e0",
              border: `1px solid ${isDark ? "#555" : "#ccc"}`,
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
          >
            Score：{poem.score ?? "-"}
          </span>
        </div>

        {/* 本文 */}
        <div
          style={{
            whiteSpace: "pre-wrap",
            fontSize: isMobile ? "1.05rem" : "1.1rem",
            lineHeight: isMobile ? "1.9" : "1.8",
            marginBottom: "1.5rem",
          }}
        >
          {poem.poem}
        </div>

        {/* 補足情報 */}
        <div style={{ fontSize: "0.9rem", opacity: 0.75 }}>
          <div>Emotion: {poem.emotion}</div>
          <div style={{ marginTop: "0.3rem" }}>
            作成日時: {new Date(poem.created_at).toLocaleString()}
          </div>
        </div>

        {/* タグ */}
        <div
          style={{
            marginTop: "1.2rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem",
          }}
        >
          {(poem.tags || []).map((t, i) => (
            <TagPill key={i} label={t} theme={theme} />
          ))}
        </div>
      </div>
    </div>
  );
}
