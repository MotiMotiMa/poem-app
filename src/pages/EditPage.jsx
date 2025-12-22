// =======================================================
// EditPage.jsx（user確定待ち・副作用分離 完成版）
// =======================================================

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import PoemForm from "../components/PoemForm/PoemForm";

export default function EditPage({ theme, setLoading }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(undefined); // undefined = 未確定

  useEffect(() => {
  console.log("EditPage mount");
  return () => console.log("EditPage unmount");
}, []);


  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };
    init();
  }, []);

  // ★ 未ログイン時のリダイレクトは副作用で
  useEffect(() => {
    if (user === null) {
      alert("ログインが必要です");
      navigate("/");
    }
  }, [user, navigate]);

  // user 未確定 or 未ログイン中は何も描画しない
  if (user !== undefined && user !== null) {
    return (
      <PoemForm
        poemId={id}
        theme={theme}
        user={user}
        setLoading={setLoading}
        onSaved={() => navigate("/")}
      />
    );
  }

  return null;
}
