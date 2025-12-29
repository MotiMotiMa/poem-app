// =======================================================
// PoemForm.jsx（完成版：UX最適化＋広画面対応＋AI評価保存対応）
// - タイトル生成UI完全復帰
// - 候補1件時は自動確定
// - 候補複数時のみ選択UI表示
// =======================================================

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

import PoemTextarea from "./PoemTextarea";
import TitleInput from "./TitleInput";
import TitleSuggestions from "./TitleSuggestions";
import EmotionSelect from "../EmotionSelect";
import TagsInput from "./TagsInput";
import PoemPDFButton from "./PoemPDFButton";

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

  const [titleCandidates, setTitleCandidates] = useState([]);
  const [titleGenError, setTitleGenError] = useState(false);

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
    const API_BASE = process.env.REACT_APP_API_BASE_URL || "";
    setIsGeneratingTitle(true);
    setTitleGenError(false);
    setTitleCandidates([]);

    try {
      const res = await fetch(
        `${window.location.origin}/api/generate-title`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ poem }),
        }
      );

      if (!res.ok) throw new Error("generate-title failed");

      const data = await res.json();

      if (Array.isArray(data.titles)) {
        // ★ 候補が1件 → 自動確定
        if (data.titles.length === 1) {
          const only = data.titles[0];
          setTimeout(() => {
            setTitle(only);
            setIsTitleSuggested(true);
            setTitleCandidates([]);
          }, 220);
        } 
        // ★ 複数 → 選択UI表示
        else if (data.titles.length > 1) {
          setTitleCandidates(data.titles);
        }
      }
    } catch (e) {
      console.error(e);
      setTitleGenError(true);
      setTimeout(() => {
        setIsGeneratingTitle(false);
        setTitleGenError(false);
      }, 900);
      return;
    }

    setIsGeneratingTitle(false);
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
      if (!res.ok) throw new Error();
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
  // キーボード表示検知
  // =====================================================
  useEffect(() => {
    const baseHeight = window.innerHeight;
    const onResize = () => {
      setKeyboardOpen(baseHeight - window.innerHeight > 120);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // =====================================================
  // JSX
  // =====================================================
  return createPortal(
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-3px); }
          100% { transform: translateX(0); }
        }
      `}</style>

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
        <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
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
                marginBottom: "0.8rem",
                background: "none",
                border: "none",
                color: palette.text,
                opacity: isGeneratingTitle ? 0.5 : 0.7,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {!isGeneratingTitle && "タイトルを生成する"}
              {isGeneratingTitle && (
                <span style={{ display: "flex", gap: "0.5rem" }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      border: `2px solid ${palette.text}`,
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.9s linear infinite",
                    }}
                  />
                  タイトルを考えています
                </span>
              )}
            </button>

            <TitleSuggestions
              titles={titleCandidates}
              palette={palette}
              onSelect={(t) => {
                setTitle(t);
                setIsTitleSuggested(true);
                setTitleCandidates([]);
              }}
              onClose={() => setTitleCandidates([])}
            />

            <EmotionSelect value={emotion} onChange={setEmotion} palette={palette} />
            <TagsInput value={tags} onChange={setTags} palette={palette} />

            {saveError && (
              <div style={{ color: "#c44545", fontSize: "0.85rem" }}>
                {saveError}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "0.75rem", background: palette.bg2 }}>
          <button
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

          <PoemPDFButton
            poem={{
              title,
              poem,
              emotion,
              score: aiScore,
              tags: tags.split(",").map(t => t.trim()).filter(Boolean),
            }}
          />

        </div>
      </div>
    </>,
    document.body
  );
}
