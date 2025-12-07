import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

import PoemForm from "../components/PoemForm";
import PoemCard from "../components/PoemCard";
import AuthButtons from "../components/AuthButtons";
import SearchBar from "../components/SearchBar";

import levenshtein from "fast-levenshtein";
import { evaluatePoem } from "../evaluatePoem";
import { generatePoemBookPDF } from "../utils/PoemBookPDF";  // ← PDF生成を読み込む

export default function PoemListPage({ theme }) {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [poems, setPoems] = useState([]);
  const [editingPoem, setEditingPoem] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  const [titleCandidates, setTitleCandidates] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

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
    const { data, error } = await supabase
      .from("poems")
      .select(
        "id, title, poem, score, comment, emotion, tags, created_at, status"
      )
      .order("created_at", { ascending: order === "asc" });

    if (!error) setPoems(data || []);
  };

  // -------------------------
  //   再評価の判定（10%変化）
  // -------------------------
  function shouldReEvaluate(prevText, newText) {
    const distance = levenshtein.get(prevText, newText);
    const maxLen = Math.max(prevText.length, newText.length);
    return distance / maxLen > 0.1;
  }

  // -------------------------
  //   保存処理（AI評価＋タグ保存）
  // -------------------------
  const handleSave = async (poemData, prevPoem = null) => {
    let status = "新規評価されました";
    let saveData = { ...poemData };
    let needsEvaluation = !prevPoem;

    if (prevPoem) {
      needsEvaluation = shouldReEvaluate(prevPoem.poem, poemData.poem);
    }

    // AI評価処理
    if (needsEvaluation) {
      const result = await evaluatePoem(poemData.title, poemData.poem);

      saveData.score = result.score;
      saveData.comment = result.comment;
      saveData.emotion = result.emotion;

      if (!prevPoem && (!poemData.title || poemData.title.trim() === "")) {
        setTitleCandidates(result.titles || []);
      } else {
        setTitleCandidates([]);
      }

      status = prevPoem ? "再評価されました" : "新規評価されました";
    } else {
      saveData.score = prevPoem.score;
      saveData.comment = prevPoem.comment;
      saveData.emotion = prevPoem.emotion;
      status = "前のスコアを維持しました";
      setTitleCandidates([]);
    }

    saveData.status = status;

    // DB保存
    if (poemData.id) {
      await supabase
        .from("poems")
        .update({
          title: saveData.title,
          poem: saveData.poem,
          score: saveData.score,
          comment: saveData.comment,
          emotion: saveData.emotion,
          tags: saveData.tags || [],
          status: saveData.status,
        })
        .eq("id", poemData.id);
    } else {
      await supabase.from("poems").insert([
        {
          title: saveData.title,
          poem: saveData.poem,
          score: saveData.score,
          comment: saveData.comment,
          emotion: saveData.emotion,
          tags: saveData.tags || [],
          status: saveData.status,
        },
      ]);
    }

    setEditingPoem(null);
    fetchPoems(sortOrder);
  };

  // -------------------------
  //   削除
  // -------------------------
  const handleDelete = async (id) => {
    await supabase.from("poems").delete().eq("id", id);
    fetchPoems(sortOrder);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    fetchPoems(e.target.value);
  };

  // -------------------------
  //   検索（title/poem/comment/emotion/tags）
  // -------------------------
  const filteredPoems = poems.filter((p) => {
    if (!searchText.trim()) return true;

    const q = searchText.toLowerCase();
    const tagString = (p.tags || []).join(" ").toLowerCase();

    return (
      p.title?.toLowerCase().includes(q) ||
      p.poem?.toLowerCase().includes(q) ||
      p.comment?.toLowerCase().includes(q) ||
      p.emotion?.toLowerCase().includes(q) ||
      tagString.includes(q)
    );
  });

  // -------------------------
  //   表示
  // -------------------------
  return (
    <div
            style={{
            fontFamily: "sans-serif",
            padding: "2rem",
            backgroundColor: theme === "dark" ? "#1e1e1e" : "#fafafa", // ← テーマ対応
            minHeight: "100vh",
            color: theme === "dark" ? "#f1f1f1" : "#111" // ← テキスト色
    }}
    >

      <h1 style={{ textAlign: "center" }}>🌈 Poem App + Tags + Search</h1>

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
          <PoemForm
            onSave={handleSave}
            editingPoem={editingPoem}
            titleCandidates={titleCandidates}
          />

          <SearchBar value={searchText} onChange={setSearchText} />

          <h2 style={{ textAlign: "center" }}>📚 保存した詩</h2>

          {/* 🔥 PDF作成ボタン追加ポイントはここ */}
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
                cursor: "pointer",
              }}
            >
              📘 詩集PDFを作る
            </button>
          </div>

          {/* 並び順 */}
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <label>並び順: </label>
            <select value={sortOrder} onChange={handleSortChange}>
              <option value="desc">新しい順</option>
              <option value="asc">古い順</option>
            </select>
          </div>

          {/* 一覧 */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            {filteredPoems.map((p) => (
              <PoemCard
                key={p.id}
                poem={p}
                onEdit={() => navigate(`/edit/${p.id}`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
