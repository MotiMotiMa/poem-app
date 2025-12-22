// =======================================================
// PoemListPage.jsx（スマホ最適化・完成版）
// - モバイルファースト
// - PoemFormはモード制御
// - 固定＋ボトム投稿ボタン
// - 無限ローディング事故防止
// - 保存完了時のみ PoemForm をクローズ
// - 一覧復帰時、該当詩カードを一瞬だけハイライト
// - 一覧復帰時のスクロール位置復元（sessionStorage）
// - ★削除時は FullscreenReader を強制クローズ
// - ★ログアウト時は UI を完全クリーンアップ
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
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

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const navigate = useNavigate();

  // -----------------------------------------------------
  // スクロール位置保存
  // -----------------------------------------------------
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
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
  // ★ ログアウト時のUIクリーンアップ（必須）
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
  }, []);

  // -----------------------------------------------------
  // 保存後（★唯一の完了トリガー）
  // -----------------------------------------------------
  const handleSave = async () => {
    await fetchPoems();

    if (editingPoem?.id) {
      setHighlightPoemId(editingPoem.id);
    }

    setEditingPoem(null);
    setIsFormOpen(false);
  };

  // -----------------------------------------------------
  // 削除（★FullscreenReader を必ず閉じる）
  // -----------------------------------------------------
  const handleDelete = async (id) => {
    if (!user) {
      alert("ログインしてください");
      return;
    }
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      setLoading(true);

      // ★ UIの後始末（先に閉じる）
      setReadingPoem(null);

      const ok = await deletePoem(id);
      if (!ok) {
        alert("削除できませんでした");
        return;
      }

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
  // ハイライト詩を中央へスクロール
  // -----------------------------------------------------
  useEffect(() => {
    if (!highlightPoemId) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(`poem-${highlightPoemId}`);
      if (!el) return;
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
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

      <AuthButtons user={user} />

      {isFormOpen && (
        <PoemForm
          poemId={editingPoem?.id || null}
          theme={safeTheme}
          user={user}
          setLoading={setLoading}
          onSaved={handleSave}
          onTitleConfirmed={() => {}}
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
