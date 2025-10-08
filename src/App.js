import { useState, useEffect } from "react";
import supabase from "./supabaseClient";
import PoemForm from "./components/PoemForm";
import PoemCard from "./components/PoemCard";
import AuthButtons from "./components/AuthButtons";
import levenshtein from "fast-levenshtein";
import { evaluatePoem } from './evaluatePoem'; // 💡これをファイルの先頭に追加


function App() {
  const [user, setUser] = useState(null);
  const [poems, setPoems] = useState([]);
  const [editingPoem, setEditingPoem] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    fetchPoems();
  }, []);

  // DBから詩を取得
  const fetchPoems = async (order = "desc") => {
    const { data, error } = await supabase
      .from("poems")
      .select("id, poem, score, comment, created_at, status")
      .order("created_at", { ascending: order === "asc" });

    if (error) {
      console.error("読み出しエラー:", error);
      return;
    }
    setPoems(data || []);
  };


  // 差分比較ロジック（10%以上なら再評価）
  function shouldReEvaluate(prevText, newText) {
    const distance = levenshtein.get(prevText, newText);
    const maxLen = Math.max(prevText.length, newText.length);
    const ratio = distance / maxLen;
    return ratio > 0.1; // 10%以上の変更で再評価
  }

  // 保存処理（差分判定あり）
  const handleSave = async (poemData, prevPoem = null) => {
    let status = "新規評価されました"; // 新規投稿時のデフォルト
    let saveData = { ...poemData };
    let needsEvaluation = !prevPoem; // 新規投稿は評価が必要

    if (prevPoem) {
      // 既存の詩の更新
      needsEvaluation = shouldReEvaluate(prevPoem.poem, poemData.poem);
    }
    
    // 💡 評価が必要な場合のみGPT APIを呼び出すロジックを追加
    if (needsEvaluation) {
        status = prevPoem ? "再評価されました" : "新規評価されました";
        
        // 🚨 ここで評価関数を呼び出す
        const result = await evaluatePoem(poemData.poem);
        
        saveData.score = result.score;
        saveData.comment = result.comment;
        
    } else if (prevPoem) {
        // 評価不要の場合、前のスコアとコメントを維持
        saveData.score = prevPoem.score;
        saveData.comment = prevPoem.comment;
        status = "前のスコアを維持しました";
    }

    saveData.status = status;

    if (poemData.id) {
      // UPDATE: idは条件で指定し、送らない
      const { error } = await supabase
        .from("poems")
        .update({
          poem: saveData.poem,
          score: Number(saveData.score) || 0,
          comment: saveData.comment || "",
          status: saveData.status || "",
        })
        .eq("id", poemData.id);

      if (error) console.error("更新エラー:", error.message, error.details);
    } else {
      // INSERT: idやcreated_atは送らない
      const { error } = await supabase.from("poems").insert([
        {
          poem: saveData.poem,
          score: Number(saveData.score) || 0,
          comment: saveData.comment || "",
          status: saveData.status || "",
        },
      ]);

      if (error) console.error("挿入エラー:", error.message, error.details);
    }

    setEditingPoem(null);
    fetchPoems(sortOrder);
  };

  const handleDelete = async (id) => {
    await supabase.from("poems").delete().eq("id", id);
    setPoems(poems.filter((p) => p.id !== id));
  };

  const handleSortChange = (e) => {
    const order = e.target.value;
    setSortOrder(order);
    fetchPoems(order);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div style={{ fontFamily: "Comic Sans MS, sans-serif", padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>🌈 Poem App + Supabase</h1>
      <AuthButtons user={user} onLogin={handleLogin} onLogout={handleLogout} />

      {user && (
        <>
          <PoemForm onSave={handleSave} editingPoem={editingPoem} />

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
                onEdit={(poem) => setEditingPoem(poem)}
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
