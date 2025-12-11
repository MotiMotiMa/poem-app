// =======================================================
// PoemForm.jsx（最終安定版・無限ぐるぐる防止）
// =======================================================

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import TitleInput from "./TitleInput";
import PoemTextarea from "./PoemTextarea";
import EmotionSelect from "../EmotionSelect";
import SubmitButton from "./SubmitButton";
import TagsInput from "./TagsInput";

import { savePoem, loadPoem } from "../../supabase/poemApi";
import { emotionPalette } from "../../styles/emotionPalette";

export default function PoemForm({
  poemId,
  theme,
  user,
  setLoading,
  onSaved,
}) {
  const navigate = useNavigate();
  const finishAnimationRef = useRef(null);

  const [title, setTitle] = useState("");
  const [poem, setPoem] = useState("");
  const [emotion, setEmotion] = useState("light");
  const [tags, setTags] = useState("");
  const [editingPoem, setEditingPoem] = useState(null);
  const [formDisabled, setFormDisabled] = useState(false);

  const palette =
    emotionPalette[emotion]?.[theme] ||
    emotionPalette.light.light;

  // 編集モード読み込み
  useEffect(() => {
    async function fetchPoem() {
      if (!poemId) return;

      setLoading(true);
      try {
        const p = await loadPoem(poemId);
        if (p) {
          setEditingPoem(p);
          setTitle(p.title || "");
          setPoem(p.poem || "");
          setEmotion(p.emotion || "light");
          setTags((p.tags || []).join(","));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPoem();
  }, [poemId, setLoading]);

  // 保存処理（完全保証版）
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("投稿するにはログインが必要です");
      return;
    }

    setFormDisabled(true);
    setLoading(true);

    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const ok = await savePoem(poemId, {
        title,
        poem,
        emotion,
        tags: tagArray,
      });

      if (!ok) {
        alert("保存できませんでした");
        return;
      }

      if (!editingPoem) {
        setTitle("");
        setPoem("");
        setEmotion("light");
        setTags("");
      } else {
        navigate("/");
      }

      if (onSaved) onSaved();
      if (finishAnimationRef.current) {
        finishAnimationRef.current();
      }
    } catch (err) {
      console.error("handleSubmit error:", err);
      alert("エラーが発生しました");
    } finally {
      // 🔒 ここが最重要
      setLoading(false);
      setFormDisabled(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        position: "relative",
        padding: "1.5rem",
        borderRadius: "12px",
        background: palette.bg2,
        color: palette.text,
        boxShadow: `0 4px 12px ${palette.shadow}`,
        opacity: formDisabled ? 0.4 : 1,
        pointerEvents: formDisabled ? "none" : "auto",
      }}
    >
      <TitleInput value={title} onChange={setTitle} palette={palette} />
      <PoemTextarea value={poem} onChange={setPoem} palette={palette} />
      <EmotionSelect value={emotion} onChange={setEmotion} palette={palette} />
      <TagsInput value={tags} onChange={setTags} palette={palette} />

      <div style={{ marginTop: "1.5rem" }}>
      <SubmitButton
        editingPoem={editingPoem}
        palette={palette}
        disabled={!user || formDisabled}
        isLoading={formDisabled}
      />
      </div>
    </form>
  );
}
