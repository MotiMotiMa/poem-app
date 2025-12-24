// =======================================================
// PoemForm.jsx（完成版：UX最適化＋広画面対応＋AI評価保存対応）
// =======================================================

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

import PoemTextarea from "./PoemTextarea";
import TitleInput from "./TitleInput";
import EmotionSelect from "../EmotionSelect";
import TagsInput from "./TagsInput";

import { savePoem, loadPoem } from "../../supabase/poemApi";
import { emotionPalette } from "../../styles/emotionPalette";

const DRAFT_KEY = "poem_draft_v1";

export default function PoemForm({
  poemId,
  theme,
  user,
  setLoading,
  onSaved,
}) {
  // =====================================================
  // device
  // =====================================================
  const [isWide, setIsWide] = useState(
    typeof window !== "undefined" && window.innerWidth >= 768
  );

  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // =====================================================
  // state
  // =====================================================
  const [title, setTitle] = useState("");
  const [poem, setPoem] = useState("");
  const [emotion, setEmotion] = useState("light");
  const [tags, setTags] = useState("");

  const [aiScore, setAiScore] = useState(0);
  const [aiComment, setAiComment] = useState("");

  const [isTitleSuggested, setIsTitleSuggested] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // =====================================================
  // theme / palette
  // =====================================================
  const safeTheme = theme || "light";

  const palette = useMemo(() => {
    return (
      emotionPalette?.[emotion]?.[safeTheme] || {
        bg: "#fafafa",
        bg2: "#ffffff",
        text: "#111",
        border: "rgba(0,0,0,0.15)",
        main: "#4b5cff",
      }
    );
  }, [emotion, safeTheme]);

  // =====================================================
  // 下書き復元
  // =====================================================
  useEffect(() => {
    if (poemId) return;
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      setTitle(d.title || "");
      setPoem(d.poem || "");
      setEmotion(d.emotion || "light");
      setTags(d.tags || "");
    } catch {}
  }, [poemId]);

  useEffect(() => {
    if (poemId) return;
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ title, poem, emotion, tags })
    );
  }, [title, poem, emotion, tags, poemId]);

  // =====================================================
  // タイトル生成
  // =====================================================
  const handleGenerateTitle = async () => {
    if (!poem.trim()) return;

    setIsGeneratingTitle(true);

    try {
      const res = await fetch(
        `${window.location.origin}/api/generate-title`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ poem }),
        }
      );

      const data = await res.json();

      if (data.titles?.[0]) {
        setTitle(data.titles[0]);
        setIsTitleSuggested(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // =====================================================
  // 編集データ読み込み
  // =====================================================
  useEffect(() => {
    async function fetchPoem() {
      if (!poemId) return;
      setLoading(true);
      try {
        const p = await loadPoem(poemId);
        if (p) {
          setTitle(p.title || "");
          setPoem(p.poem || "");
          setEmotion(p.emotion || "light");
          setTags((p.tags || []).join(","));
          setAiScore(p.score ?? 0);
          setAiComment(p.comment ?? "");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPoem();
  }, [poemId, setLoading]);

  // =====================================================
  // 保存処理
  // =====================================================
  const handleSave = async () => {
    if (!user) {
      setSaveError("ログインが必要です");
      return;
    }
    if (!poem.trim()) {
      setSaveError("本文が空です");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const ok = await savePoem(poemId, {
        title,
        poem,
        emotion,
        score: aiScore,
        comment: aiComment,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      });

      if (!ok) {
        setSaveError("保存に失敗しました");
        return;
      }

      localStorage.removeItem(DRAFT_KEY);
      setShowSavedToast(true);
      setTimeout(() => onSaved?.(), 900);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // AI評価
  // =====================================================
  const handleEvaluate = async () => {
    if (!poem.trim()) return;

    setIsEvaluating(true);

    try {
      const res = await fetch(
        `${window.location.origin}/api/evaluate-poem`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ poem }),
        }
      );

      const data = await res.json();
      setAiScore(data.score ?? 0);
      setAiComment(data.comment ?? "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  // =====================================================
  // キーボード表示検知（viewport 高さ差）
  // =====================================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const baseHeight = window.innerHeight;

    const onResize = () => {
      const diff = baseHeight - window.innerHeight;
      setKeyboardOpen(diff > 120);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // =====================================================
  // JSX
  // =====================================================
  return createPortal(
    <>
      <div
        style={{
          position: isWide ? "relative" : "fixed",
          inset: isWide ? "auto" : 0,
          height: isWide ? "auto" : "100dvh",
          background: palette.bg,
          color: palette.text,
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "1rem",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <PoemTextarea
            value={poem}
            onChange={setPoem}
            palette={palette}
            autoFocus
            poetMode
          />

          <div style={{ marginTop: "1.5rem" }}>
            <TitleInput
              value={title}
              isSuggested={isTitleSuggested}
              onChange={(v) => {
                setTitle(v);
                setIsTitleSuggested(false);
              }}
              palette={palette}
            />

            <button
              type="button"
              onClick={handleGenerateTitle}
              disabled={isGeneratingTitle}
              style={{
                marginBottom: "1rem",
                opacity: isGeneratingTitle ? 0.5 : 0.8,
                background: "none",
                border: "none",
                color: palette.text,
                cursor: "pointer",
              }}
            >
              仮タイトルを生成
            </button>

            <EmotionSelect
              value={emotion}
              onChange={setEmotion}
              palette={palette}
            />
            <TagsInput value={tags} onChange={setTags} palette={palette} />
          </div>
        </div>

        <div
          style={{
            padding: "0.75rem",
            background: palette.bg2,
            borderRadius: "18px",
            opacity: keyboardOpen ? 0.55 : 1,
            transition: "opacity 0.25s ease",
            backdropFilter: keyboardOpen ? "blur(2px)" : "none",
          }}
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !user}
            style={{
              width: "100%",
              borderRadius: "14px",
              background: palette.main,
              color: "#fff",
              padding: "0.7rem",
              border: "none",
              fontWeight: "bold",
            }}
          >
            {saving ? "保存しています…" : "保存する"}
          </button>

          <button
            type="button"
            onClick={handleEvaluate}
            style={{
              width: "100%",
              marginTop: "0.6rem",
              borderRadius: "14px",
              background: "transparent",
              border: `1px solid ${palette.border}`,
              color: palette.text,
              padding: "0.6rem",
            }}
          >
            AI評価
          </button>
        </div>
      </div>

      {isEvaluating && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.15)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: palette.bg2,
              padding: "1.2rem 1.4rem",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              color: palette.text,
            }}
          >
            <span
              style={{
                width: "18px",
                height: "18px",
                border: `2px solid ${palette.text}`,
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                opacity: 0.6,
              }}
            />
            読後を生成しています
          </div>
        </div>
      )}

      {showSavedToast && (
        <div
          style={{
            position: "fixed",
            bottom: "6rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: palette.bg2,
            padding: "0.6rem 1rem",
            borderRadius: "18px",
            zIndex: 10002,
          }}
        >
          ✓ 保存しました
        </div>
      )}
    </>,
    document.body
  );
}
