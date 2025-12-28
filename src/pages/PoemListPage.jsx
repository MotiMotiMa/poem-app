// =======================================================
// PoemListPage.jsx（スマホ最適化・完成版）
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
import { generatePoemBookPDF } from "../utils/PoemBookPDF";


const SCROLL_KEY = "poemListScrollY";

// ---- 年単位PDF生成 ----
const generateYearPoemPDF = (poems) => {
  const year = new Date().getFullYear();
  const yearPoems = poems.filter((p) => {
    if (!p.created_at) return false;
    return new Date(p.created_at).getFullYear() === year;
  });
  if (!yearPoems.length) return;
  generatePoemBookPDF(yearPoems);
};

export default function PoemListPage({ theme, setLoading }) {
  // ---------- theme ----------
  const safeTheme = theme || "light";
  const isDark = safeTheme === "dark";

  const bgColor = isDark ? "#121212" : "#fafafa";
  const textColor = isDark ? "#f1f1f1" : "#111";

  // ---------- device ----------
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ---------- state ----------
  const [user, setUser] = useState(null);
  const [poems, setPoems] = useState([]);
  const [highlightPoemId, setHighlightPoemId] = useState(null);

  const [editingPoem, setEditingPoem] = useState(null);
  const [readingPoem, setReadingPoem] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const navigate = useNavigate();

  // -----------------------------------------------------
  // スクロール位置保存 / 復元
  // -----------------------------------------------------
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    };
    window.addEventListener("scroll", saveScroll, { passive: true });
    return () => window.removeEventListener("scroll", saveScroll);
  }, []);

  useEffect(() => {
    const y = sessionStorage.getItem(SCROLL_KEY);
    if (!y) return;
    requestAnimationFrame(() => window.scrollTo(0, Number(y)));
  }, []);

  // -----------------------------------------------------
  // 認証
  // -----------------------------------------------------
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // -----------------------------------------------------
  // ログアウト時クリーンアップ
  // -----------------------------------------------------
  useEffect(() => {
    if (user) return;
    setIsFormOpen(false);
    setEditingPoem(null);
    setReadingPoem(null);
  }, [user]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  // -----------------------------------------------------
  // 保存後
  // -----------------------------------------------------
  const handleSave = async () => {
    await fetchPoems();
    if (editingPoem?.id) setHighlightPoemId(editingPoem.id);
    setEditingPoem(null);
    setIsFormOpen(false);
  };

  // -----------------------------------------------------
  // 削除
  // -----------------------------------------------------
  const handleDelete = async (id) => {
    if (!user) return alert("ログインしてください");
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      setLoading(true);
      setReadingPoem(null);
      const ok = await deletePoem(id);
      if (!ok) return alert("削除できませんでした");
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
      <h1 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        🌈 詩作成システム
      </h1>

      <AuthButtons user={user} />

      {/* 検索トリガー */}
      {user && (
        <button
          onClick={() => setShowSearch((v) => !v)}
          style={{
            margin: "0.4rem auto 0.8rem",
            display: "block",
            background: "none",
            border: "none",
            fontSize: "0.75rem",
            color: "#666",
            opacity: 0.55,
            cursor: "pointer",
          }}
        >
          探す
        </button>
      )}

      {/* SearchBar（トグル式） */}
      {showSearch && (
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          onClose={() => {
            setSearchText("");
            setShowSearch(false);
          }}
        />
      )}

      {isFormOpen && (
        <PoemForm
          poemId={editingPoem?.id || null}
          theme={safeTheme}
          user={user}
          setLoading={setLoading}
          onSaved={handleSave}
        />
      )}

      {user && (
        <PoemCarousel
          poems={filteredPoems}
          highlightPoemId={highlightPoemId}
          user={user}
          onEdit={(p) => navigate(`/edit/${p.id}`)}
          onDelete={handleDelete}
          onTagClick={setSelectedTag}
          onRead={(p) => setReadingPoem(p)}
          theme={safeTheme}
        />
      )}

      <button
        type="button"
        onClick={() => generatePoemBookPDF(poems)}
        style={{
          margin: "1rem auto",
          display: "block",
          background: "none",
          border: "none",
          color: "#666",
          opacity: 0.5,
          fontSize: "0.8rem",
          cursor: "pointer",
        }}
      >
        詩集として残す
      </button>

      {new Date().getMonth() === 11 && (
        <button
          type="button"
          onClick={() => generateYearPoemPDF(poems)}
          style={{
            margin: "0.4rem auto 1.2rem",
            display: "block",
            background: "none",
            border: "none",
            color: "#666",
            opacity: 0.35,
            fontSize: "0.75rem",
            cursor: "pointer",
          }}
        >
          今年の詩集を残す
        </button>
      )}

      {readingPoem && (
        <FullscreenReader
          poem={readingPoem}
          onClose={() => setReadingPoem(null)}
          onTagClick={setSelectedTag}
          theme={safeTheme}
        />
      )}

      {user && !isFormOpen && (
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
    </div>
  );
}
