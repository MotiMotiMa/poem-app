// ================================================
// PoemListPage.jsx（レベル9：読書モード＋Appローディング対応）
// ================================================

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

import PoemForm from "../components/PoemForm";
import PoemCard from "../components/PoemCard";
import AuthButtons from "../components/AuthButtons";
import SearchBar from "../components/SearchBar";
import PoemCarousel from "../components/PoemCarousel";
import FullscreenReader from "../components/FullscreenReader";

import levenshtein from "fast-levenshtein";
import { evaluatePoem } from "../evaluatePoem";
import { generatePoemBookPDF } from "../utils/PoemBookPDF";

export default function PoemListPage({ theme, setLoading }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [poems, setPoems] = useState([]);
  const [editingPoem, setEditingPoem] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  const [titleCandidates, setTitleCandidates] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // ★ フルスクリーン読書モード
  const [readingPoem, setReadingPoem] = useState(null);

  // -------------------------
  //   認証セッション
  // -------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    fetchPoems();
  }, []);

  // -------------------------
  //   DBから詩を取得
  // -------------------------
  const fetchPoems = async (order = "desc") => {
    const { data } = await supabase
      .from("poems")
      .select(
        "id, title, poem, score, comment, emotion, tags, created_at, status"
      )
      .order("created_at", { ascending: order === "asc" });

    setPoems(data || []);
  };

  // -------------------------
  //   再評価の判定
  // -------------------------
  function shouldReEvaluate(prevText, newText) {
    const distance = levenshtein.get(prevText, newText);
    const maxLen = Math.max(prevText.length, newText.length);
    return distance / maxLen > 0.1;
  }

  // -------------------------
  //   保存処理（AI評価）
  //   ★ App.js の「全画面ぐるぐる」を使用
  // -------------------------
  const handleSave = async (poemData, prevPoem = null) => {
    setLoading(true); // ← 全画面ぐるぐる開始

    let saveData = { ...poemData };
    let needsEvaluation = !prevPoem;

    if (prevPoem) {
      needsEvaluation = shouldReEvaluate(prevPoem.poem, poemData.poem);
    }

    if (needsEvaluation) {
      const result = await evaluatePoem(poemData.title, poemData.poem);

      saveData.score = result.score;
      saveData.comment = result.comment;
      saveData.emotion = result.emotion;
      saveData.tags = result.tags || [];

      if (!prevPoem && (!poemData.title || poemData.title.trim() === "")) {
        setTitleCandidates(result.titles || []);
      } else {
        setTitleCandidates([]);
      }

      saveData.status = prevPoem ? "再評価されました" : "新規評価されました";
    } else {
      saveData.score = prevPoem.score;
      saveData.comment = prevPoem.comment;
      saveData.emotion = prevPoem.emotion;
      saveData.tags = prevPoem.tags || [];
      saveData.status = "前のスコアを維持しました";
      setTitleCandidates([]);
    }

    // DB保存
    if (poemData.id) {
      await supabase.from("poems").update(saveData).eq("id", poemData.id);
    } else {
      await supabase.from("poems").insert([saveData]);
    }

    setEditingPoem(null);
    await fetchPoems(sortOrder);

    setLoading(false); // ← ぐるぐる終了
  };

  // -------------------------
  //   削除
  //   ★ 削除時も全画面ぐるぐる
  // -------------------------
  const handleDelete = async (id) => {
    setLoading(true);

    await supabase.from("poems").delete().eq("id", id);
    await fetchPoems(sortOrder);

    setLoading(false);
  };

  // -------------------------
  //   表示高速化（useMemo）
  // -------------------------
  const filteredPoems = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    const tagQ = selectedTag.toLowerCase().trim();

    return poems.filter((p) => {
      if (tagQ && !(p.tags || []).includes(selectedTag)) return false;
      if (!q) return true;

      const tagString = (p.tags || []).join(" ").toLowerCase();

      return (
        p.title?.toLowerCase().includes(q) ||
        p.poem?.toLowerCase().includes(q) ||
        p.comment?.toLowerCase().includes(q) ||
        p.emotion?.toLowerCase().includes(q) ||
        tagString.includes(q)
      );
    });
  }, [poems, searchText, selectedTag]);

  // -------------------------
  //   UI
  // -------------------------
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "2rem",
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#fafafa",
        minHeight: "100vh",
        color: theme === "dark" ? "#f1f1f1" : "#111",
      }}
    >
      <h1 style={{ textAlign: "center" }}>🌈 詩作成システム（読書モード）</h1>

      <AuthButtons
        user={user}
        onLogin={async () =>
          await supabase.auth.signInWithOAuth({ provider: "google" })
        }
        onLogout={async () => {
          await supabase.auth.signOut();
          setUser(null);
        }}
      />

      {user && (
        <>
          {/* 投稿フォーム */}
          <PoemForm
            onSave={handleSave}
            editingPoem={editingPoem}
            titleCandidates={titleCandidates}
          />

          {/* 検索 */}
          <SearchBar value={searchText} onChange={setSearchText} />

          <h2 style={{ textAlign: "center" }}>📚 保存した詩</h2>

          {/* PDF */}
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <button
              onClick={() => generatePoemBookPDF(filteredPoems)}
              style={{
                padding: "0.7rem 1.4rem",
                marginBottom: "1rem",
                borderRadius: "8px",
                border: "none",
                background: "#6c5ce7",
                color: "#fff",
                fontWeight: "600",
              }}
            >
              📘 詩集PDFを作る
            </button>
          </div>

          {/* カルーセル */}
          <PoemCarousel
            poems={filteredPoems}
            onEdit={(p) => {
              setEditingPoem(p);
              navigate(`/edit/${p.id}`);
            }}
            onDelete={handleDelete}
            onTagClick={(tag) => setSelectedTag(tag)}
            onRead={(p) => setReadingPoem(p)} // 読書モード
          />

          {/* フルスクリーン読書モード */}
          {readingPoem && (
            <FullscreenReader
              poem={readingPoem}
              onClose={() => setReadingPoem(null)}
              onTagClick={(tag) => setSelectedTag(tag)}
            />
          )}
        </>
      )}
    </div>
  );
}
