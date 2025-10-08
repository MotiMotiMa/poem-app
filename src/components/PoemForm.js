import { useState, useEffect } from "react";

export default function PoemForm({ onSave, editingPoem }) {
  const [poemText, setPoemText] = useState("");

  useEffect(() => {
    if (editingPoem) {
      setPoemText(editingPoem.poem);
    } else {
      setPoemText("");
    }
  }, [editingPoem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!poemText.trim()) return;

    const poemData = editingPoem
      ? { ...editingPoem, poem: poemText }
      : { poem: poemText };

    onSave(poemData, editingPoem); // prevPoemを渡す
    setPoemText("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ textAlign: "center", margin: "1rem" }}>
      <textarea
        value={poemText}
        onChange={(e) => setPoemText(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: "0.5rem" }}
      />
      <button type="submit" style={{ marginTop: "0.5rem" }}>
        {editingPoem ? "更新する" : "投稿する"}
      </button>
    </form>
  );
}
