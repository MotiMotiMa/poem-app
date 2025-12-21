// =======================================================
// EditPage.jsx（修正版）
// =======================================================

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import PoemForm from "../components/PoemForm/PoemForm";

export default function EditPage({ theme, setLoading }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };
    init();
  }, []);

  return (
    <PoemForm
      poemId={id}
      theme={theme}
      user={user}               // ★ ここが本丸
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
