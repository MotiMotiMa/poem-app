// =======================================================
// PoemForm.jsx（完成版：UX最適化＋広画面対応＋AI評価保存対応）
// - 以前の下部固定ボタンUIに復帰
// - 保存トースト復帰
// - AI評価中オーバーレイ復帰
// - PDFボタンも下部バーに復帰（PoemPDFButton）
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
        if (data.titles.length === 1) {
          const only = data.titles[0];
          setTimeout(() => {
            setTitle(only);
            setIsTitleSuggested(true);
            setTitleCandidates([]);
          }, 220);
        } else {
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
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
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

      if (!res.ok) throw new Error("evaluate-poem failed");

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

            {/* ===============================
    タイトル自動生成ボタン
=============================== */}
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
    cursor: "pointer",
  }}
>
  {isGeneratingTitle && (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.85rem",
        opacity: titleGenError ? 0.8 : 0.65,
        color: titleGenError ? "#c44545" : palette.text,
        animation: titleGenError ? "shake 0.4s ease" : "none",
      }}
    >
      <span
        style={{
          width: "14px",
          height: "14px",
          border: `2px solid ${
            titleGenError ? "#c44545" : palette.text
          }`,
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: titleGenError
            ? "none"
            : "spin 0.9s linear infinite",
        }}
      />
      {titleGenError
        ? "うまく掴めませんでした"
        : "タイトルを考えています"}
    </div>
  )}
</button>

{/* ===============================
    タイトル候補表示
=============================== */}
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
                cursor: "pointer",
              }}
            >
              {isGeneratingTitle && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    opacity: titleGenError ? 0.8 : 0.65,
                    color: titleGenError ? "#c44545" : palette.text,
                    animation: titleGenError ? "shake 0.4s ease" : "none",
                  }}
                >
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      border: `2px solid ${
                        titleGenError ? "#c44545" : palette.text
                      }`,
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: titleGenError
                        ? "none"
                        : "spin 0.9s linear infinite",
                    }}
                  />
                  {titleGenError
                    ? "うまく掴めませんでした"
                    : "タイトルを考えています"}
                </div>
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

            <EmotionSelect
              value={emotion}
              onChange={setEmotion}
              palette={palette}
            />
            <TagsInput value={tags} onChange={setTags} palette={palette} />

            {saveError && (
              <div style={{ color: "#c44545", fontSize: "0.85rem", marginTop: "0.7rem" }}>
                {saveError}
              </div>
            )}
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
              cursor: saving ? "default" : "pointer",
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
              cursor: "pointer",
            }}
          >
            AI評価
          </button>

          <div style={{ marginTop: "0.6rem" }}>
            <PoemPDFButton
              title={title}
              poem={poem}
              emotion={emotion}
              score={aiScore}
              tags={tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)}
              palette={palette}
            />
          </div>
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
