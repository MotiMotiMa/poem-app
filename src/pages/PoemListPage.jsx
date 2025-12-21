// =======================================================
// PoemListPage.jsx（スマホ最適化・完成版）
// - モバイルファースト
// - PoemFormはモード制御
// - 固定＋ボトム投稿ボタン
// - 無限ローディング事故防止
// - タイトル確定で700ms後にPoemFormをクローズ
// - 一覧復帰時、該当詩カードを一瞬だけハイライト
// - 一覧復帰時のスクロール位置復元（sessionStorage）
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

const SCROLL_KEY = "poemListScrollY";

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
  const [highlightPoemId, setHighlightPoemId] = useState(null);

  const [editingPoem, setEditingPoem] = useState(null);
  const [readingPoem, setReadingPoem] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const navigate = useNavigate();

  // -----------------------------------------------------
  // スクロール位置保存
  // -----------------------------------------------------
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(
        SCROLL_KEY,
        String(window.scrollY)
      );
    };

    window.addEventListener("scroll", saveScroll, { passive: true });
    return () => window.removeEventListener("scroll", saveScroll);
  }, []);

  // -----------------------------------------------------
  // スクロール位置復元
  // -----------------------------------------------------
  useEffect(() => {
    const y = sessionStorage.getItem(SCROLL_KEY);
    if (!y) return;

    requestAnimationFrame(() => {
      window.scrollTo(0, Number(y));
    });
  }, []);

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
  // PC用：PoemFormカードラッパー
  // -----------------------------------------------------
  function PoemFormCard({ children }) {
    return (
      <div
        style={{
          maxWidth: "720px",
          margin: "2rem auto",
          padding: "1.5rem",
          background: "#ffffff",
          borderRadius: "18px",
          boxShadow: `
            0 10px 30px rgba(0,0,0,0.15),
            0 4px 10px rgba(0,0,0,0.08)
          `,
        }}
      >
        {children}
      </div>
    );
  }

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
// ハイライト詩を中央へスクロール
// -----------------------------------------------------
useEffect(() => {
  if (!highlightPoemId) return;

  // DOM が確実に描画されてから動かす
  requestAnimationFrame(() => {
    const el = document.getElementById(`poem-${highlightPoemId}`);
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      inline: "center",   // 横カルーセルの中心
      block: "nearest",
    });
  });
}, [highlightPoemId, filteredPoems]);

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

      {isFormOpen &&
        (isMobile ? (
          <PoemForm
            poemId={editingPoem?.id || null}
            theme={safeTheme}
            user={user}
            setLoading={setLoading}
            onSaved={handleSave}
            onTitleConfirmed={(poemId) => {
              setHighlightPoemId(poemId);
              setTimeout(() => {
                setIsFormOpen(false);
                setEditingPoem(null);
              }, 700);
            }}
          />
        ) : (
          <PoemFormCard>
            <PoemForm
              poemId={editingPoem?.id || null}
              theme={safeTheme}
              user={user}
              setLoading={setLoading}
              onSaved={handleSave}
              onTitleConfirmed={(poemId) => {
                setHighlightPoemId(poemId);
                setTimeout(() => {
                  setIsFormOpen(false);
                  setEditingPoem(null);
                }, 700);
              }}
            />
          </PoemFormCard>
        ))}

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
                boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              }}
            >
              ＋
            </button>
          )}
        </div>
      )}

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

      {readingPoem && (
        <FullscreenReader
          poem={readingPoem}
          onClose={() => setReadingPoem(null)}
          onTagClick={setSelectedTag}
          theme={safeTheme}
        />
      )}

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
