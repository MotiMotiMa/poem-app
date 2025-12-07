import { useState, useEffect } from "react";
import supabase from "./supabaseClient";
import PoemForm from "./components/PoemForm";
import PoemCard from "./components/PoemCard";
import AuthButtons from "./components/AuthButtons";
import levenshtein from "fast-levenshtein";
import { evaluatePoem } from "./evaluatePoem";

function App() {
  const [user, setUser] = useState(null);
  const [poems, setPoems] = useState([]);
  const [editingPoem, setEditingPoem] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  // 🔥 AIタイトル候補
  const [titleCandidates, setTitleCandidates] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    fetchPoems();
  }, []);

  // DBから取得
  const fetchPoems = async (order = "desc") => {
    const { data, error } = await supabase
      .from("poems")
      .select("id, title, poem, score, comment, emotion, created_at, status")
      .order("created_at", { ascending: order === "asc" });

    if (!error) setPoems(data || []);
  };

  // 変更が10％超なら再評価
  function shouldReEvaluate(prevText, newText) {
    const distance = levenshtein.get(prevText, newText);
    const maxLen = Math.max(prevText.length, newText.length);
    return distance / maxLen > 0.1;
  }

  // 🔥 保存処理（AI評価＋タイトル候補）
  const handleSave = async (poemData, prevPoem = null) => {
    let status = "新規評価されました";
    let saveData = { ...poemData };
    let needsEvaluation = !prevPoem;

    if (prevPoem) {
      needsEvaluation = shouldReEvaluate(prevPoem.poem, poemData.poem);
    }

    // AI評価を行う場合
    if (needsEvaluation) {
      const result = await evaluatePoem(poemData.title, poemData.poem);

      saveData.score = result.score;
      saveData.comment = result.comment;
      saveData.emotion = result.emotion;

      // 🔥 新規投稿 × タイトルなし → AI候補をフォームへ
      if (!prevPoem && (!poemData.title || poemData.title.trim() === "")) {
        setTitleCandidates(result.titles || []);
      } else {
        setTitleCandidates([]);
      }

      status = prevPoem ? "再評価されました" : "新規評価されました";
    } else {
      // 🔥 再評価なし → 前回のスコア・コメント・emotion維持
      saveData.score = prevPoem.score;
      saveData.comment = prevPoem.comment;
      saveData.emotion = prevPoem.emotion;
      status = "前のスコアを維持しました";
      setTitleCandidates([]);
    }

    saveData.status = status;

    // UPDATE or INSERT
    if (poemData.id) {
      const { error } = await supabase
        .from("poems")
        .update({
          title: saveData.title,
          poem: saveData.poem,
          score: saveData.score,
          comment: saveData.comment,
          emotion: saveData.emotion,
          status: saveData.status,
        })
        .eq("id", poemData.id);

      if (error) console.error("更新エラー:", error);
    } else {
      const { error } = await supabase.from("poems").insert([
        {
          title: saveData.title,
          poem: saveData.poem,
          score: saveData.score,
          comment: saveData.comment,
          emotion: saveData.emotion,
          status: saveData.status,
        },
      ]);

      if (error) console.error("挿入エラー:", error);
    }

    setEditingPoem(null);
    fetchPoems(sortOrder);
  };

  const handleDelete = async (id) => {
    await supabase.from("poems").delete().eq("id", id);
    fetchPoems(sortOrder);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    fetchPoems(e.target.value);
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>🌈 Poem App + Supabase</h1>

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
          {/* 🔥 タイトル候補付き */}
          <PoemForm
            onSave={handleSave}
            editingPoem={editingPoem}
            titleCandidates={titleCandidates}
          />

          <h2 style={{ textAlign: "center" }}>📚 保存した詩</h2>

          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <label>並び順: </label>
            <select value={sortOrder} onChange={handleSortChange}>
              <option value="desc">新しい順</option>
              <option value="asc">古い順</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            {poems.map((p) => (
              <PoemCard
                key={p.id}
                poem={p}
                onEdit={(poem) => {
                  setEditingPoem(poem);
                  setTitleCandidates([]);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
