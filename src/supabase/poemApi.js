// =======================================================
// poemApi.js（最終安定版・RLS完全対応）
// - 詩の取得・保存・削除
// - 一覧取得
// - AI評価（evaluatePoem）
// =======================================================

import supabase from "../supabaseClient";
import { evaluatePoem } from "../ai/evaluatePoem";

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
// ③ 詩の保存（AI評価 + RLS安全版）
// -------------------------------------------------------
export async function savePoem(id, poemData) {
  let updatedData = { ...poemData };

  // -------------------------------
  // 認証ユーザー取得（RLS必須）
  // -------------------------------
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("未ログインのため保存できません");
    return null;
  }

  // -------------------------------
  // AI評価
  // -------------------------------
  try {
    const result = await evaluatePoem(
      poemData.title,
      poemData.poem
    );

    updatedData.score = result.score;
    updatedData.comment = result.comment;
    updatedData.emotion = result.emotion;
    updatedData.tags = result.tags || [];
    updatedData.status = id
      ? "再評価されました"
      : "新規評価されました";
  } catch (err) {
    console.error("AI評価エラー:", err);
    updatedData.status = "AI評価に失敗しました";
    updatedData.tags = updatedData.tags || [];
  }

  // -------------------------------
  // 保存処理（重要：selectしない）
  // -------------------------------
  if (id) {
    // 更新
    const { error } = await supabase
      .from("poems")
      .update(updatedData)
      .eq("id", id);

    if (error) {
      console.error("savePoem update error:", error);
      return null;
    }
  } else {
    // 新規投稿（user_id を必ず付与）
    const { error } = await supabase
      .from("poems")
      .insert([
        {
          ...updatedData,
          user_id: user.id,
        },
      ]);

    if (error) {
      console.error("savePoem insert error:", error);
      return null;
    }
  }

  // ⚠️ 返り値は使わない
  // 呼び出し側で loadPoemList() を呼ぶ前提
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
