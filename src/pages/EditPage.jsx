// =======================================================
// EditPage.jsx（user確定待ち対応・完成版）
// =======================================================

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import PoemForm from "../components/PoemForm/PoemForm";

export default function EditPage({ theme, setLoading }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(undefined); // ★ nullではなく undefined

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };
    init();
  }, []);

  // ----------------------------------
  // user確定待ち（ここが肝）
  // ----------------------------------
  if (user === undefined) {
    return null; // or ローディング表示
  }

  // 未ログインなら弾く（任意）
  if (user === null) {
    alert("ログインが必要です");
    navigate("/");
    return null;
  }

  return (
    <PoemForm
      poemId={id}
      theme={theme}
      user={user}            // ★ 必ず存在する状態で渡す
      setLoading={setLoading}
      onSaved={() => navigate("/")}
      onTitleConfirmed={() => {
        setTimeout(() => {
          navigate("/");
        }, 700);
      }}
    />
  );
}
