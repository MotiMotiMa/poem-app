// src/components/PoemForm.jsx
import { useState, useEffect } from "react";
import EmotionSelect from "../EmotionSelect";

export default function PoemForm({ onSave, editingPoem, titleCandidates }) {
  const [title, setTitle] = useState("");
  const [poemText, setPoemText] = useState("");
  const [emotion, setEmotion] = useState("cool");
  const [tags, setTags] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  // -------------------------
  // 編集時データ充填
  // -------------------------
  useEffect(() => {
    if (editingPoem) {
      setTitle(editingPoem.title || "");
      setPoemText(editingPoem.poem || "");
      setEmotion(editingPoem.emotion || "cool");
      setTags((editingPoem.tags || []).join(", "));
    } else {
      setTitle("");
      setPoemText("");
      setEmotion("cool");
      setTags("");
    }
  }, [editingPoem]);

  // -------------------------
  // 詩の整形
  // -------------------------
  const normalizePoem = (text) => {
    return (
      text
        .replace(/\u3000/g, " ") // 全角スペース → 半角
        .replace(/\n{3,}/g, "\n\n") // 空行3つ以上 → 2つに
        .split("\n")
        .map((line) => line.replace(/^\s+/, "")) // 行頭スペース削除
        .join("\n")
    );
  };

  // -------------------------
  // バリデーション
  // -------------------------
  const validate = () => {
    let newErrors = {};

    if (!title.trim()) newErrors.title = "題名を入力してください";
    else if (/^[\s。、,.!?！？・…ー-]+$/.test(title))
      newErrors.title = "題名が記号だけになっています";
    else if (title.length > 50)
      newErrors.title = "題名は50文字以内で入力してください";

    const normalized = normalizePoem(poemText);
    const lines = normalized.split("\n");

    if (!normalized.trim()) newErrors.poemText = "本文を入力してください";
    else if (normalized.length < 5)
      newErrors.poemText = "本文は5文字以上必要です";
    else if (lines.length < 2)
      newErrors.poemText = "詩として最低2行以上必要です";
    else if (lines.some((l) => l.match(/^\s+$/)))
      newErrors.poemText = "空白のみの行が含まれています";

    if (!emotion) newErrors.emotion = "感情テーマを選んでください";

    const tagList = tags
      .replace(/、/g, ",")
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    if (tagList.length > 10)
      newErrors.tags = "タグは10個以内にしてください";

    return newErrors;
  };

  // -------------------------
  // 保存処理
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setLoading(true);

    const normalizedPoem = normalizePoem(poemText);
    const saveTags = tags
      .replace(/、/g, ",")
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const poemData = editingPoem
      ? { ...editingPoem, title, poem: normalizedPoem, emotion, tags: saveTags }
      : { title, poem: normalizedPoem, emotion, tags: saveTags };

    await onSave(poemData, editingPoem);

    setLoading(false);
  };

  // -------------------------
  // 色
  // -------------------------
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
    error: "#ff7675",
    info: isDark ? "#81c7ff" : "#2980b9"
  };

  return (
    <>
      {/* ローディング */}
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "6px solid #ddd",
              borderTop: "6px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

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
            marginBottom: "0.5rem",
          }}
        />
        {errors.title && (
          <div style={{ color: colors.error, marginBottom: "1rem" }}>
            {errors.title}
          </div>
        )}

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
                    cursor: "pointer",
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
            marginBottom: "0.5rem",
          }}
        />
        {errors.poemText && (
          <div style={{ color: colors.error, marginBottom: "1rem" }}>
            {errors.poemText}
          </div>
        )}

        {/* emotion */}
        <label style={{ display: "block", fontWeight: "600", color: colors.label }}>
          感情テーマ
        </label>
        <EmotionSelect
          value={emotion}
          onChange={setEmotion}
          colors={colors}
        />

        {/* Auto 情報表示 */}
        {emotion === "auto" && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.6rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              background: isDark ? "#333" : "#eaf6ff",
              color: colors.info,
            }}
          >
            ※ AI が詩の内容から emotion を自動判定します
          </div>
        )}

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
        {errors.tags && (
          <div style={{ color: colors.error, marginBottom: "1rem" }}>
            {errors.tags}
          </div>
        )}

        {/* ボタン */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.8rem",
            borderRadius: "10px",
            background: colors.buttonBg,
            color: colors.buttonText,
            border: "none",
            fontSize: "1.1rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "保存中…" : editingPoem ? "更新する" : "投稿する"}
        </button>
      </form>
    </>
  );
}
