// =======================================================
// PoemForm.jsx（完成版：UX最適化＋広画面対応＋AI評価保存対応）
// - タイトル生成UI完全復帰
// - 候補1件時は自動確定
// - 候補複数時のみ選択UI表示
// - Gemini / GPT 切替トグル（localStorage保持）
// =======================================================

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

import PoemTextarea from "./PoemTextarea";
import TitleInput from "./TitleInput";
import TitleSuggestions from "./TitleSuggestions";
import EmotionSelect from "../EmotionSelect";
import TagsInput from "./TagsInput";
import PoemActionBar from "./PoemActionBar";
import TitleGenerateButton from "./TitleGenerateButton";

import { savePoem, loadPoem } from "../../supabase/poemApi";
import { emotionPalette } from "../../styles/emotionPalette";

const DRAFT_KEY = "poem_draft_v1";
const AI_PROVIDER_KEY = "poem_ai_provider_v1"; // 追加

export default function PoemForm({ poemId, theme, user, setLoading, onSaved }) {
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

  const [titleCandidates, setTitleCandidates] = useState([]);
  const [titleGenError, setTitleGenError] = useState(false);

  // =====================================================
  // AI Provider（トグル + 永続化）
  // =====================================================
  const [aiProvider, setAiProvider] = useState(() => {
    try {
      const v = localStorage.getItem(AI_PROVIDER_KEY);
      return v === "gpt" || v === "gemini" ? v : "gpt"; // デフォルトはgpt推奨
    } catch {
      return "gpt";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(AI_PROVIDER_KEY, aiProvider);
    } catch {}
  }, [aiProvider]);

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
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, poem, emotion, tags }));
  }, [title, poem, emotion, tags, poemId]);

  // =====================================================
  // タイトル生成（ルーター経由）
  // =====================================================
  const handleGenerateTitle = async () => {
    if (!poem.trim()) return;

    setIsGeneratingTitle(true);
    setTitleGenError(false);
    setTitleCandidates([]);

    try {
      const res = await fetch(`${window.location.origin}/api/generate-title-router`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-provider": aiProvider,
        },
        body: JSON.stringify({ poem }),
      });

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
        } else if (data.titles.length > 1) {
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
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });

      if (!ok) {
        setSaveError("保存に失敗しました");
        return;
      }

      localStorage.removeItem(DRAFT_KEY);
      setTimeout(() => onSaved?.(), 900);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // AI評価（ルーター経由）
  // =====================================================
  const handleEvaluate = async () => {
    if (!poem.trim()) return;
    setIsEvaluating(true);

    try {
      const res = await fetch(`${window.location.origin}/api/evaluate-poem-router`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-provider": aiProvider,
        },
        body: JSON.stringify({ poem }),
      });

      if (!res.ok) throw new Error("evaluate failed");

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
  // 小さなトグルUI
  // =====================================================
  const AiToggle = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginTop: "0.8rem",
        padding: "0.6rem 0.7rem",
        border: `1px solid ${palette.border}`,
        borderRadius: 12,
        background: palette.bg2,
      }}
    >
      <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
        AI: <b>{aiProvider === "gpt" ? "GPT" : "Gemini"}</b>
      </div>

      <div style={{ display: "flex", gap: "0.35rem", marginLeft: "auto" }}>
        <button
          type="button"
          onClick={() => setAiProvider("gpt")}
          disabled={aiProvider === "gpt" || isGeneratingTitle || isEvaluating}
          style={{
            padding: "0.35rem 0.6rem",
            borderRadius: 10,
            border: `1px solid ${palette.border}`,
            background: aiProvider === "gpt" ? palette.main : "transparent",
            color: aiProvider === "gpt" ? "#fff" : palette.text,
            opacity: aiProvider === "gpt" ? 1 : 0.9,
            cursor: aiProvider === "gpt" ? "default" : "pointer",
            fontSize: "0.85rem",
          }}
        >
          GPT
        </button>

        <button
          type="button"
          onClick={() => setAiProvider("gemini")}
          disabled={aiProvider === "gemini" || isGeneratingTitle || isEvaluating}
          style={{
            padding: "0.35rem 0.6rem",
            borderRadius: 10,
            border: `1px solid ${palette.border}`,
            background: aiProvider === "gemini" ? palette.main : "transparent",
            color: aiProvider === "gemini" ? "#fff" : palette.text,
            opacity: aiProvider === "gemini" ? 1 : 0.9,
            cursor: aiProvider === "gemini" ? "default" : "pointer",
            fontSize: "0.85rem",
          }}
        >
          Gemini
        </button>
      </div>
    </div>
  );

  // =====================================================
  // JSX
  // =====================================================
  return createPortal(
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

          <TitleGenerateButton
            onClick={handleGenerateTitle}
            isGenerating={isGeneratingTitle}
            hasError={titleGenError}
            palette={palette}
          />

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

          <AiToggle />

          <EmotionSelect value={emotion} onChange={setEmotion} palette={palette} />
          <TagsInput value={tags} onChange={setTags} palette={palette} />

          {saveError && (
            <div style={{ color: "#c44545", fontSize: "0.85rem" }}>
              {saveError}
            </div>
          )}
        </div>
      </div>

      <PoemActionBar
        onSave={handleSave}
        onEvaluate={handleEvaluate}
        saving={saving}
        user={user}
        palette={palette}
        isEvaluating={isEvaluating}
        poemForPdf={{
          title,
          poem,
          emotion,
          score: aiScore,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }}
        aiProvider={aiProvider}
        setAiProvider={setAiProvider}
      />
    </div>,
    document.body
  );
}
