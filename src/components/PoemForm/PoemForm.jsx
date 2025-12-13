// =======================================================
// PoemForm.jsx（Portal対応・書き終わり検知 → 保存予告＋タイトル生成）
// =======================================================

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

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

      if (editingPoem) {
        navigate("/");
      } else {
        setTitle("");
        setPoem("");
        setEmotion("light");
        setTags("");
        setShowMeta(false);
        setTitleCandidates([]);
      }

      if (onSaved) onSaved();
    } finally {
      setLoading(false);
      setFormDisabled(false);
    }
  };

  // ---------------- JSX（Portal） ----------------
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: palette.bg,
        color: palette.text,
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
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
            <TitleInput value={title} onChange={setTitle} palette={palette} />

            {titleCandidates.length > 0 && (
              <div style={{ marginTop: "0.75rem" }}>
                {titleCandidates.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setTitle(t)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "0.6rem",
                      marginBottom: "0.4rem",
                      borderRadius: "10px",
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

            <EmotionSelect
              value={emotion}
              onChange={setEmotion}
              palette={palette}
            />

            <TagsInput value={tags} onChange={setTags} palette={palette} />
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
            padding: "0.6rem 1rem",
            borderRadius: "16px",
            fontSize: "0.85rem",
            boxShadow: `0 6px 18px ${palette.shadow}`,
            display: "flex",
            gap: "0.75rem",
          }}
        >
          <span>ひと区切りつきました</span>
          <button
            onClick={generateTitle}
            disabled={isGeneratingTitle}
            style={{
              background: "none",
              border: "none",
              color: palette.primary,
              textDecoration: "underline",
            }}
          >
            タイトル生成
          </button>
        </div>
      )}

      {/* Floating Bottom Bar */}
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
          boxShadow:
            "0 12px 28px rgba(0,0,0,0.35), 0 4px 10px rgba(0,0,0,0.25)",
        }}
      >
        <button
          onClick={handleSave}
          disabled={formDisabled || !user}
          style={{
            width: "100%",
            border: "none",
            borderRadius: "14px",
            background: palette.main,
            color: "#fff",
            fontWeight: "bold",
            padding: "0.7rem",
            opacity: formDisabled || !user ? 0.5 : 1,
          }}
        >
          {editingPoem ? "更新する" : "保存する"}
        </button>
      </div>
    </div>,
    document.body
  );
}
