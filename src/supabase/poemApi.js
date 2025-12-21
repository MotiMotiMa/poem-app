// =======================================================
// poemApi.js（最終完成形・RLS完全対応）
// - 詩の取得・一覧・保存・削除のみを担当
// - AI評価は一切行わない（外部で済ませて渡す）
// =======================================================

import supabase from "../supabaseClient";

// -------------------------------------------------------
// ① 詩１件取得
// -------------------------------------------------------
export async function loadPoem(id) {
  const { data, error } = await supabase
    .from("poems")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("loadPoem error:", error);
    return null;
  }

  return data;
}

// -------------------------------------------------------
// ② 詩一覧取得
// -------------------------------------------------------
export async function loadPoemList(order = "desc") {
  const { data, error } = await supabase
    .from("poems")
    .select(
      "id, title, poem, score, comment, emotion, tags, created_at, status, user_id"
    )
    .order("created_at", { ascending: order === "asc" });

  if (error) {
    console.error("loadPoemList error:", error);
    return [];
  }

  return data || [];
}

// -------------------------------------------------------
// ③ 詩の保存（評価済みデータをそのまま保存）
// -------------------------------------------------------
export async function savePoem(id, poemData) {
  // -------------------------------
  // 認証ユーザー取得（RLS必須）
  // -------------------------------
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("未ログインのため保存できません");
    return false;
  }

  // -------------------------------
  // 保存処理
  // poemData には以下が含まれている前提：
  // title, poem, score, comment, emotion, tags, status
  // -------------------------------
  if (id) {
    // 更新
    const { error } = await supabase
      .from("poems")
      .update({
        ...poemData,
        user_id: user.id, // 念のため上書き
      })
      .eq("id", id);

    if (error) {
      console.error("savePoem update error:", error);
      return false;
    }
  } else {
    // 新規投稿
    const { error } = await supabase
      .from("poems")
      .insert([
        {
          ...poemData,
          user_id: user.id,
        },
      ]);

    if (error) {
      console.error("savePoem insert error:", error);
      return false;
    }
  }

  return true;
}

// -------------------------------------------------------
// ④ 詩の削除
// -------------------------------------------------------
export async function deletePoem(id) {
  const { error } = await supabase
    .from("poems")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deletePoem error:", error);
    return false;
  }

  return true;
}
