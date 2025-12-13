// =======================================================
// PoemListPage.jsx（スマホ最適化・完成版）
// - モバイルファースト
// - PoemFormはモード制御
// - 固定＋ボトム投稿ボタン
// - 無限ローディング事故防止
// =======================================================

import { useState, useEffect, useMemo } from "react";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import AuthButtons from "../components/AuthButtons";
import SearchBar from "../components/SearchBar";
import PoemCarousel from "../components/PoemCarousel";
import FullscreenReader from "../components/FullscreenReader";
import PoemForm from "../components/PoemForm/PoemForm";

import { loadPoemList, deletePoem } from "../supabase/poemApi";

export default function PoemListPage({ theme, setLoading }) {
  // ---------- theme ----------
  const safeTheme = theme || "light";
  const isDark = safeTheme === "dark";

  const bgColor = isDark ? "#121212" : "#fafafa";
  const textColor = isDark ? "#f1f1f1" : "#111";

  // ---------- device ----------
  const isMobile = window.innerWidth < 768;

  // ---------- state ----------
  const [user, setUser] = useState(null);
  const [poems, setPoems] = useState([]);

  const [editingPoem, setEditingPoem] = useState(null);
  const [readingPoem, setReadingPoem] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  // -----------------------------------------------------
  // 認証セッション取得
  // -----------------------------------------------------
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // -----------------------------------------------------
  // 詩一覧取得
  // -----------------------------------------------------
  const fetchPoems = async () => {
    try {
      setLoading(true);
      const list = await loadPoemList("desc");
      setPoems(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoems();
  }, []);

  // -----------------------------------------------------
  // 保存後
  // -----------------------------------------------------
  const handleSave = async () => {
    await fetchPoems();
    setEditingPoem(null);
    setIsFormOpen(false);
  };

  // -----------------------------------------------------
  // 削除
  // -----------------------------------------------------
  const handleDelete = async (id) => {
    if (!user) {
      alert("ログインしてください");
      return;
    }

    if (!window.confirm("本当に削除しますか？")) return;

    try {
      setLoading(true);
      const ok = await deletePoem(id);
      if (!ok) alert("削除できませんでした");
      await fetchPoems();
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // 検索 & タグフィルタ
  // -----------------------------------------------------
  const filteredPoems = useMemo(() => {
    const q = searchText.toLowerCase();
    const tagQ = selectedTag.toLowerCase();

    return poems.filter((p) => {
      if (tagQ && !(p.tags || []).includes(selectedTag)) return false;
      if (!q) return true;

      return (
        p.title?.toLowerCase().includes(q) ||
        p.poem?.toLowerCase().includes(q) ||
        (p.tags || []).join(" ").toLowerCase().includes(q)
      );
    });
  }, [poems, searchText, selectedTag]);

  // -----------------------------------------------------
  // JSX
  // -----------------------------------------------------
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: isMobile ? "0.75rem" : "2rem",
        backgroundColor: bgColor,
        minHeight: "100vh",
        color: textColor,
      }}
    >
      {/* ---------- Header ---------- */}
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        🌈 詩作成システム
      </h1>

      <AuthButtons
        user={user}
        onLogin={() =>
          supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: window.location.origin },
          })
        }
        onLogout={() => supabase.auth.signOut()}
      />

      {/* ---------- Form（モード制御） ---------- */}
      {isFormOpen && (
        <PoemForm
          poemId={editingPoem?.id || null}
          theme={safeTheme}
          user={user}
          setLoading={setLoading}
          onSaved={handleSave}
        />
      )}

        {/* ---------- Search + New (PC) ---------- */}
    {(!isMobile || showSearch) && (
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          maxWidth: "720px",
          margin: "0 auto 1.5rem",
        }}
      >
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          theme={safeTheme}
        />

        {!isMobile && (
          <button
            onClick={() => {
              setEditingPoem(null);
              setIsFormOpen(true);
            }}
            aria-label="新しい詩を書く"
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              border: "none",
              background: isDark ? "#6c63ff" : "#4b5cff",
              color: "#fff",
              fontSize: "1.6rem",
              fontWeight: "bold",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
            }}
          >
            ＋
          </button>
        )}
      </div>
    )}


      {/* ---------- Poem List ---------- */}
      <PoemCarousel
        poems={filteredPoems}
        user={user}
        onEdit={(p) => {
          setEditingPoem(p);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
        onTagClick={setSelectedTag}
        onRead={(p) => setReadingPoem(p)}
        theme={safeTheme}
      />

      {/* ---------- Reader ---------- */}
      {readingPoem && (
        <FullscreenReader
          poem={readingPoem}
          onClose={() => setReadingPoem(null)}
          onTagClick={setSelectedTag}
          theme={safeTheme}
        />
      )}

      {/* ---------- Mobile FAB ---------- */}
      {isMobile && !isFormOpen && (
        <button
          onClick={() => {
            setEditingPoem(null);
            setIsFormOpen(true);
          }}
          style={{
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            fontSize: "28px",
            border: "none",
            background: "#ff6b6b",
            color: "#fff",
            zIndex: 1000,
          }}
        >
          ＋
        </button>
      )}

      {/* ---------- Mobile Search Toggle ---------- */}
      {isMobile && (
        <button
          onClick={() => setShowSearch((v) => !v)}
          style={{
            position: "fixed",
            bottom: "1rem",
            left: "1rem",
            padding: "0.6rem 0.9rem",
            borderRadius: "20px",
            border: "none",
            background: isDark ? "#333" : "#ddd",
            color: textColor,
            zIndex: 1000,
          }}
        >
          検索
        </button>
      )}
    </div>
  );
}
