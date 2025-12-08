// src/pages/EditPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import supabase from "../supabaseClient";
import PoemForm from "../components/PoemForm";
import useSavePoem from "../hooks/useSavePoem";
import usePoems from "../hooks/usePoems";

export default function EditPage({ setLoading }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poem, setPoem] = useState(null);
  const [pageLoading, setPageLoading] = useState(true); // ← ページ専用のローディング

  const { refresh } = usePoems();

  const { savePoem } = useSavePoem({
    refresh,
    setTitleCandidates: () => {},
    setEditingPoem: () => {},
  });

  // ダークモード判定
  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const colors = {
    bg: isDark ? "#1c1c1c" : "#f5f5f5",
    card: isDark ? "#2b2b2b" : "#ffffff",
    text: isDark ? "#e8e8e8" : "#2d2d2d",
    border: isDark ? "#444" : "#ccc",
    link: isDark ? "#81c7ff" : "#2980b9",
  };

  // --------------------------
  // データ読み込み（ページ自体のローディング）
  // --------------------------
  useEffect(() => {
    async function load() {
      setPageLoading(true);

      const { data } = await supabase
        .from("poems")
        .select("*")
        .eq("id", id)
        .single();

      setPoem(data);
      setPageLoading(false);
    }
    load();
  }, [id]);

  // --------------------------
  // 保存処理（App.js の全画面ぐるぐるを使用）
  // --------------------------
  const handleSave = async (poemData) => {
    setLoading(true); // ← 全画面ぐるぐる起動

    await savePoem(poemData, poem);

    setLoading(false); // ← ぐるぐる解除
    navigate("/");
  };

  // --------------------------
  // ページロード中（ページ用ぐるぐる）
  // --------------------------
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

  // --------------------------
  // データなし
  // --------------------------
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

  // --------------------------
  // 通常画面
  // --------------------------
  return (
    <div
      style={{
        background: colors.bg,
        minHeight: "100vh",
        padding: "2rem",
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
          onSave={handleSave}
          editingPoem={poem}
          titleCandidates={[]} // 編集時はタイトル候補なし
        />
      </div>
    </div>
  );
}
