import { useState, useEffect } from "react";

export default function usePoemFormState({ onSave, editingPoem }) {
  const [title, setTitle] = useState("");
  const [poemText, setPoemText] = useState("");
  const [emotion, setEmotion] = useState("cool");

  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  // ダーク / ライトテーマ
  const colors = {
    card: isDark ? "#2e2e2e" : "#ffffff",
    text: isDark ? "#f1f2f6" : "#2d3436",
    label: isDark ? "#dfe6e9" : "#2d3436",
    inputBg: isDark ? "#3b3b3b" : "#ffffff",
    inputBorder: isDark ? "#555" : "#dfe6e9",
    buttonBg: editingPoem
      ? isDark ? "#2980b9" : "#74b9ff"
      : isDark ? "#27ae60" : "#55efc4",
    buttonText: isDark ? "#ecf0f1" : "#2d3436",
    candidateBg: isDark ? "#555" : "#eeeeee",
  };

  // 編集 or 新規 初期化
  useEffect(() => {
    if (editingPoem) {
      setTitle(editingPoem.title || "");
      setPoemText(editingPoem.poem);
      setEmotion(editingPoem.emotion || "cool");
    } else {
      setTitle("");
      setPoemText("");
      setEmotion("cool");
    }
  }, [editingPoem]);

  const handleSubmit = (e, title, poemText, emotion) => {
    e.preventDefault();
    if (!poemText.trim()) return;
    const poemData = editingPoem
      ? { ...editingPoem, title, poem: poemText, emotion }
      : { title, poem: poemText, emotion };
    onSave(poemData, editingPoem);
  };

  return {
    title,
    poemText,
    emotion,
    setTitle,
    setPoemText,
    setEmotion,
    handleSubmit,
    isDark,
    colors,
  };
}
