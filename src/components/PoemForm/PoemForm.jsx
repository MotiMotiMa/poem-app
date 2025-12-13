// =======================================================
// PoemForm.jsx（書き終わり検知 → 保存予告＋タイトル生成）
// =======================================================

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import PoemTextarea from "./PoemTextarea";
import TitleInput from "./TitleInput";
import EmotionSelect from "../EmotionSelect";
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
  const idleTimerRef = useRef(null);

  // ---------------- state ----------------
  const [title, setTitle] = useState("");
  const [poem, setPoem] = useState("");
  const [emotion, setEmotion] = useState("light");
  const [tags, setTags] = useState("");
  const [editingPoem, setEditingPoem] = useState(null);

  const [formDisabled, setFormDisabled] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  const [titleCandidates, setTitleCandidates] = useState([]);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  const [showSaveHint, setShowSaveHint] = useState(false);

  const palette =
    emotionPalette[emotion]?.[theme] ||
    emotionPalette.light.light;

  // ---------------- 編集読み込み ----------------
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
          setShowMeta(true);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPoem();
  }, [poemId, setLoading]);

  // ---------------- 書き終わり検知 ----------------
  useEffect(() => {
    if (!poem) {
      setShowSaveHint(false);
      return;
    }

    setShowSaveHint(false);

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      if (/[。．\n\s]$/.test(poem.trimEnd())) {
        setShowSaveHint(true);
      }
    }, 2500);

    return () => clearTimeout(idleTimerRef.current);
  }, [poem]);

  // ---------------- タイトル生成 ----------------
  const generateTitle = async () => {
    if (!poem.trim()) return;

    setIsGeneratingTitle(true);

    try {
      const res = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poem, emotion }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setTitleCandidates(data.titles || []);
      setShowMeta(true);
    } catch {
      alert("タイトル生成に失敗しました");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // ---------------- 保存 ----------------
  const handleSave = async () => {
    if (!user) {
      alert("投稿するにはログインが必要です");
      return;
    }

    if (!poem.trim()) {
      alert("本文が空です");
      return;
    }

    setFormDisabled(true);
    setLoading(true);
    setShowSaveHint(false);

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
        setShowMeta(false);
        setTitleCandidates([]);
      } else {
        navigate("/");
      }

      if (onSaved) onSaved();
    } catch (e) {
      console.error(e);
      alert("エラーが発生しました");
    } finally {
      setLoading(false);
      setFormDisabled(false);
    }
  };

  // ---------------- JSX ----------------
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: palette.bg,
        color: palette.text,
        display: "flex",
        flexDirection: "column",
        zIndex: 2000,
      }}
    >
      {/* Body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          paddingBottom: "12rem",
        }}
      >
        <PoemTextarea
          value={poem}
          onChange={setPoem}
          palette={palette}
          autoFocus
          poetMode
        />

        {showMeta && (
          <div style={{ marginTop: "1.5rem" }}>
            <TitleInput
              value={title}
              onChange={setTitle}
              palette={palette}
            />

            <EmotionSelect
              value={emotion}
              onChange={setEmotion}
              palette={palette}
            />

            <TagsInput
              value={tags}
              onChange={setTags}
              palette={palette}
            />

            {titleCandidates.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                  AIタイトル候補
                </div>
                {titleCandidates.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setTitle(t)}
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: "0.4rem",
                      padding: "0.6rem",
                      borderRadius: "8px",
                      border: "none",
                      background: palette.bg2,
                      color: palette.text,
                      textAlign: "left",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 保存予告＋タイトル生成 */}
      {showSaveHint && (
        <div
          style={{
            position: "fixed",
            bottom: "6.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: palette.bg2,
            color: palette.text,
            padding: "0.6rem 1rem",
            borderRadius: "16px",
            fontSize: "0.85rem",
            boxShadow: `0 6px 18px ${palette.shadow}`,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span style={{ opacity: 0.85 }}>
            ひと区切りつきました
          </span>
          <button
            onClick={generateTitle}
            disabled={isGeneratingTitle}
            style={{
              background: "none",
              border: "none",
              color: palette.primary,
              fontSize: "0.85rem",
              textDecoration: "underline",
              opacity: isGeneratingTitle ? 0.5 : 1,
            }}
          >
            タイトル生成
          </button>
        </div>
      )}

      {/* Floating Bottom Bar（保存のみ） */}
      <div
        style={{
          position: "fixed",
          left: "0.75rem",
          right: "0.75rem",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
          padding: "0.75rem",
          background: palette.bg2,
          borderRadius: "18px",
          border: `1px solid ${palette.border}`,
          boxShadow: `
            0 12px 28px rgba(0,0,0,0.35),
            0 4px 10px rgba(0,0,0,0.25)
          `,
          display: "flex",
          zIndex: 3000,
        }}
      >
        <button
          onClick={handleSave}
          disabled={formDisabled || !user}
          style={{
            flex: 1,
            border: "none",
            borderRadius: "14px",
            background: palette.main,
            color: "#fff",
            fontWeight: "bold",
            fontSize: "0.95rem",
            padding: "0.7rem",
            opacity: formDisabled || !user ? 0.5 : 1,
          }}
        >
          {editingPoem ? "更新する" : "保存する"}
        </button>
      </div>
    </div>
  );
}
