import { useState, useEffect } from "react";

export default function PoemForm({ onSave, editingPoem, titleCandidates, tagCandidates }) {
  
  const [title, setTitle] = useState("");
  const [poemText, setPoemText] = useState("");
  const [emotion, setEmotion] = useState("cool");
  const [tags, setTags] = useState("");

  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  useEffect(() => {
    if (editingPoem) {
      setTitle(editingPoem.title || "");
      setPoemText(editingPoem.poem);
      setEmotion(editingPoem.emotion || "cool");
      setTags((editingPoem.tags || []).join(", "));
    } else {
      setTitle("");
      setPoemText("");
      setEmotion("cool");
      setTags("");
    }
  }, [editingPoem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!poemText.trim()) return;

    const saveTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const poemData = editingPoem
      ? { ...editingPoem, title, poem: poemText, emotion, tags: saveTags }
      : { title, poem: poemText, emotion, tags: saveTags };

    onSave(poemData, editingPoem);
  };

  const addTag = (tag) => {
    const currentTags = tags.split(",").map((t) => t.trim()).filter((t) => t);
    if (!currentTags.includes(tag)) {
      setTags([...currentTags, tag].join(", "));
    }
  };

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

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: colors.card,
        padding: "1.3rem",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "380px",
        margin: "1.5rem auto",
        boxShadow: isDark
          ? "0 4px 14px rgba(0,0,0,0.6)"
          : "0 4px 14px rgba(0,0,0,0.12)",
        fontFamily: "'YuMincho', serif",
        color: colors.text,
      }}
    >
      {/* 題名 */}
      <label style={{ display: "block", fontWeight: "600", color: colors.label }}>
        題名
      </label>
      <input
        type="text"
        placeholder="（題名を入力）"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "0.8rem",
          borderRadius: "8px",
          border: `1px solid ${colors.inputBorder}`,
          background: colors.inputBg,
          color: colors.text,
          marginBottom: "1rem",
        }}
      />

      {/* AIタイトル候補 */}
      {!editingPoem && titleCandidates?.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              color: colors.label,
              marginBottom: "0.3rem",
            }}
          >
            AIタイトル候補
          </label>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {titleCandidates.map((candidate, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setTitle(candidate)}
                style={{
                  padding: "0.4rem 0.7rem",
                  borderRadius: "6px",
                  background: colors.candidateBg,
                  border: "none",
                  color: colors.text,
                  fontSize: "0.9rem",
                }}
              >
                {candidate}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 本文 */}
      <label style={{ display: "block", fontWeight: "600", color: colors.label }}>
        詩の本文
      </label>
      <textarea
        rows={6}
        placeholder="詩を入力してください…"
        value={poemText}
        onChange={(e) => setPoemText(e.target.value)}
        style={{
          width: "100%",
          padding: "0.8rem",
          borderRadius: "8px",
          border: `1px solid ${colors.inputBorder}`,
          background: colors.inputBg,
          color: colors.text,
          marginBottom: "1rem",
          whiteSpace: "pre-wrap",
        }}
      />

      {/* emotion */}
      <label style={{ display: "block", fontWeight: "600", color: colors.label }}>
        感情テーマ
      </label>
      <select
        value={emotion}
        onChange={(e) => setEmotion(e.target.value)}
        style={{
          width: "100%",
          padding: "0.7rem",
          borderRadius: "8px",
          marginBottom: "1.2rem",
          background: colors.inputBg,
          border: `1px solid ${colors.inputBorder}`,
          color: colors.text,
        }}
      >
        <option value="warm">warm（優しい・懐かしい）</option>
        <option value="cool">cool（静けさ・孤独）</option>
        <option value="dark">dark（苦しみ・影）</option>
        <option value="light">light（希望・光）</option>
      </select>

      {/* タグ */}
      <label style={{ display: "block", fontWeight: "600", color: colors.label }}>
        タグ（カンマ区切り）
      </label>
      <input
        type="text"
        placeholder="例：光, 闇, 恋"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        style={{
          width: "100%",
          padding: "0.8rem",
          borderRadius: "8px",
          border: `1px solid ${colors.inputBorder}`,
          background: colors.inputBg,
          color: colors.text,
          marginBottom: "1.2rem",
        }}
      />

      {/* AIタグ候補 */}
      {!editingPoem && tagCandidates?.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              color: colors.label,
              marginBottom: "0.3rem",
            }}
          >
            AIタグ候補
          </label>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {tagCandidates.map((tag, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addTag(tag)}
                style={{
                  padding: "0.4rem 0.7rem",
                  borderRadius: "6px",
                  background: colors.candidateBg,
                  border: "none",
                  color: colors.text,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        style={{
          width: "100%",
          padding: "0.8rem",
          borderRadius: "10px",
          background: colors.buttonBg,
          color: colors.buttonText,
          border: "none",
          fontSize: "1.1rem",
          fontWeight: "600",
        }}
      >
        {editingPoem ? "更新する" : "投稿する"}
      </button>
    </form>
  );
}
