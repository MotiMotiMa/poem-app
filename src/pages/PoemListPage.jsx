// =======================================================
// PoemListPage.jsx（theme + auth + 投稿制御・最終安定版）
// =======================================================

import { useState, useEffect, useMemo } from "react";
import supabase from "../supabaseClient";

import AuthButtons from "../components/AuthButtons";
import SearchBar from "../components/SearchBar";
import PoemCarousel from "../components/PoemCarousel";
import FullscreenReader from "../components/FullscreenReader";
import PoemForm from "../components/PoemForm/PoemForm";

import {
  loadPoemList,
  deletePoem,
} from "../supabase/poemApi";

export default function PoemListPage({ theme, setLoading }) {
  // ---------- theme 安全化 ----------
  const safeTheme = theme || "light";
  const isDark = safeTheme === "dark";

  const bgColor = isDark ? "#121212" : "#fafafa";
  const textColor = isDark ? "#f1f1f1" : "#111";

  const [user, setUser] = useState(null);
  const [poems, setPoems] = useState([]);

  const [editingPoem, setEditingPoem] = useState(null);
  const [readingPoem, setReadingPoem] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // -----------------------------------------------------
  // 認証セッション取得（確定版）
  // -----------------------------------------------------
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      console.log("LOGIN USER ID（確定）:", data.session?.user?.id);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      console.log("LOGIN USER ID（確定）:", session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // -----------------------------------------------------
  // 詩一覧取得（1か所のみ）
  // -----------------------------------------------------
  const fetchPoems = async () => {
    const list = await loadPoemList("desc");
    setPoems(list);
  };

  useEffect(() => {
    fetchPoems();
  }, []);

  // -----------------------------------------------------
  // 保存後
  // -----------------------------------------------------
  const handleSave = async () => {
    setLoading(true);
    await fetchPoems();
    setEditingPoem(null);
    setLoading(false);
  };

  // -----------------------------------------------------
  // 削除（ログイン必須）
  // -----------------------------------------------------
  const handleDelete = async (id) => {
    if (!user) {
      alert("ログインしてください");
      return;
    }

    if (!window.confirm("本当に削除しますか？")) return;

    setLoading(true);
    const ok = await deletePoem(id);
    await fetchPoems();
    setLoading(false);

    if (!ok) {
      alert("削除できませんでした");
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
        padding: "2rem",
        backgroundColor: bgColor,
        minHeight: "100vh",
        color: textColor,
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        🌈 詩作成システム（読書モード）
      </h1>

      <AuthButtons
        user={user}
        onLogin={() =>
          supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: window.location.origin,
            },
          })
        }
        onLogout={() => supabase.auth.signOut()}
      />

      {/* 投稿フォーム */}
      <PoemForm
        poemId={editingPoem?.id || null}
        theme={safeTheme}
        user={user}
        setLoading={setLoading}
        onSaved={handleSave}
      />

      <SearchBar
        value={searchText}
        onChange={setSearchText}
        theme={safeTheme}
      />

      <PoemCarousel
        poems={filteredPoems}
        user={user}
        onEdit={(p) => setEditingPoem(p)}
        onDelete={handleDelete}
        onTagClick={setSelectedTag}
        onRead={(p) => setReadingPoem(p)}
        theme={safeTheme}
      />

      {readingPoem && (
        <FullscreenReader
          poem={readingPoem}
          onClose={() => setReadingPoem(null)}
          onTagClick={setSelectedTag}
          theme={safeTheme}
        />
      )}
    </div>
  );
}
