// =======================================================
// PoemForm.jsx（完成版：UX最適化＋広画面対応＋AI評価保存対応）
// =======================================================

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

import PoemTextarea from "./PoemTextarea";
import TitleInput from "./TitleInput";
import TitleSuggestions from "./TitleSuggestions";
import EmotionSelect from "../EmotionSelect";
import TagsInput from "./TagsInput";

import { savePoem, loadPoem } from "../../supabase/poemApi";
import { emotionPalette } from "../../styles/emotionPalette";
import PoemPDFButton from "./PoemPDFButton";


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
  const [showRetry, setShowRetry] = useState(false);
  const [retryUsed, setRetryUsed] = useState(false); // ★ 追加（再試行1回制限）

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
    setShowRetry(false);
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
        setTitleGenError(false);
        setIsGeneratingTitle(false);

        // ★ 再試行は1回だけ
        if (!retryUsed) {
          setShowRetry(true);
          setRetryUsed(true);
          setTimeout(() => setShowRetry(false), 3000);
        }
      }, 900);
      return;
    }

    setIsGeneratingTitle(false);
  };

  // =====================================================
  // JSX
  // =====================================================
  return createPortal(
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
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

            <button
              type="button"
              onClick={handleGenerateTitle}
              disabled={isGeneratingTitle}
              style={{
                marginBottom: "0.4rem",
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

            {showRetry && (
              <div
                onClick={() => {
                  setShowRetry(false);
                  handleGenerateTitle();
                }}
                style={{
                  fontSize: "0.75rem",
                  color: palette.text,
                  opacity: 0.5,
                  cursor: "pointer",
                  marginBottom: "0.6rem",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.opacity = 0.8)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.opacity = 0.5)
                }
              >
                もう一度だけ
              </div>
            )}

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
           <PoemPDFButton
                title={title}
                poem={poem}
                emotion={emotion}
                score={aiScore}
                tags={tags
                  .split(",")
                  .map(t => t.trim())
                  .filter(Boolean)}
                palette={palette}
            />
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
