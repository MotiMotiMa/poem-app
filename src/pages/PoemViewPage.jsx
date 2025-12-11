// =======================================================
// PoemViewPage.jsx（TagPill対応・theme完全対応）
// =======================================================

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import supabase from "../supabaseClient";
import TagPill from "../components/TagPill";

export default function PoemViewPage({ theme }) {
  const { id } = useParams();
  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);

  const isDark = theme === "dark";

  const colors = {
    bg: isDark ? "#1d1d1d" : "#f4f4f4",
    card: isDark ? "#2b2b2b" : "#ffffff",
    text: isDark ? "#eeeeee" : "#222222",
    border: isDark ? "#444" : "#ccc",
    link: isDark ? "#81c7ff" : "#1e88e5",
  };

  // ------------------------------
  // 詩を取得
  // ------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data } = await supabase
        .from("poems")
        .select("*")
        .eq("id", id)
        .single();

      setPoem(data);
      setLoading(false);
    }

    load();
  }, [id]);

  // ------------------------------
  // ローディング
  // ------------------------------
  if (loading) {
    return (
      <div
        style={{
          background: colors.bg,
          color: colors.text,
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.2rem",
        }}
      >
        読み込み中…
      </div>
    );
  }

  if (!poem) {
    return (
      <div
        style={{
          background: colors.bg,
          color: colors.text,
          minHeight: "100vh",
          padding: "2rem",
        }}
      >
        詩が見つかりません。
      </div>
    );
  }

  // ------------------------------
  // 本文ページ
  // ------------------------------
  return (
    <div
      style={{
        background: colors.bg,
        minHeight: "100vh",
        padding: "2rem",
        color: colors.text,
        fontFamily: "'YuMincho', serif",
      }}
    >
      {/* 戻る */}
      <div style={{ marginBottom: "1.5rem" }}>
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
          maxWidth: "600px",
          margin: "0 auto",
          padding: "2rem",
          background: colors.card,
          borderRadius: "12px",
          border: `1px solid ${colors.border}`,
          boxShadow: isDark
            ? "0 4px 16px rgba(0,0,0,0.6)"
            : "0 4px 16px rgba(0,0,0,0.15)",
          color: colors.text,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "1rem",
            lineHeight: "1.5",
          }}
        >
          {poem.title}
        </h2>

        {/* スコア（バッジ風） */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "1.2rem",
          }}
        >
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
            fontSize: "1.1rem",
            lineHeight: "1.8",
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

        {/* タグ（TagPill 使用） */}
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
