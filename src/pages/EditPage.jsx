// =======================================================
// EditPage.jsx
// - 新規作成 / 編集 統合版
// - poemId があれば編集、なければ新規
// =======================================================

import { useParams, useNavigate } from "react-router-dom";
import PoemForm from "../components/PoemForm/PoemForm";

export default function EditPage({ theme, setLoading }) {
  const { id } = useParams(); // undefined = 新規
  const navigate = useNavigate();

  return (
    <PoemForm
      poemId={id}
      theme={theme}
      setLoading={setLoading}
      onSaved={() => {
        navigate("/");
      }}
      onTitleConfirmed={() => {
        setTimeout(() => {
          navigate("/");
        }, 700);
      }}
    />
  );
}
