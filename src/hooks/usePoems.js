import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

export default function usePoems() {
  const [poems, setPoems] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");

  // 初期ロード
  useEffect(() => {
    fetchPoems(sortOrder);
  }, []);

  // 並び順変更
  const changeSort = (order) => {
    setSortOrder(order);
    fetchPoems(order);
  };

  // DBから詩一覧を取得
  const fetchPoems = async (order = "desc") => {
    const { data, error } = await supabase
      .from("poems")
      .select("id, title, poem, score, comment, emotion, created_at, status")
      .order("created_at", { ascending: order === "asc" });

    if (!error) setPoems(data || []);
  };

  // 外からリロードできるように公開
  const refresh = () => fetchPoems(sortOrder);

  return {
    poems,
    refresh,
    sortOrder,
    setSortOrder: changeSort,
  };
}
