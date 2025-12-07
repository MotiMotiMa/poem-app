import supabase from "../supabaseClient";
import levenshtein from "fast-levenshtein";
import { evaluatePoem } from "../evaluatePoem";

export default function useSavePoem({ refresh, setTitleCandidates, setEditingPoem }) {
  // 10%以上変更されたら再評価
  function shouldReEvaluate(prevText, newText) {
    const distance = levenshtein.get(prevText, newText);
    const maxLen = Math.max(prevText.length, newText.length);
    return distance / maxLen > 0.1;
  }

  // 🔥 保存処理（新規 / 編集）
  const savePoem = async (poemData, prevPoem = null) => {
    const isEditing = !!prevPoem;
    let status = isEditing ? "再評価されました" : "新規評価されました";
    let saveData = { ...poemData };

    let needsEvaluation =
      !isEditing || shouldReEvaluate(prevPoem.poem, poemData.poem);

    // ▼ AI評価が必要な場合
    if (needsEvaluation) {
      const result = await evaluatePoem(poemData.title, poemData.poem);

      saveData.score = result.score;
      saveData.comment = result.comment;
      saveData.emotion = result.emotion;

      // 新規かつタイトル空 → AIタイトル候補を出す
      if (!isEditing && (!poemData.title || poemData.title.trim() === "")) {
        setTitleCandidates(result.titles || []);
      } else {
        setTitleCandidates([]); // 編集では候補を出さない
      }
    } else {
      // ▼ 再評価なし
      saveData.score = prevPoem.score;
      saveData.comment = prevPoem.comment;
      saveData.emotion = prevPoem.emotion;
      status = "前のスコアを維持しました";
      setTitleCandidates([]);
    }

    saveData.status = status;

    // ▼ DB更新 or 新規保存
    if (isEditing) {
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

    // 編集モード解除 & 再読込
    setEditingPoem(null);
    refresh();
  };

  return { savePoem };
}
