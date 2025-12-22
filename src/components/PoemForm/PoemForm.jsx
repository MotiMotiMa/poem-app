// =======================================================
// PoemForm.jsx（完成版：UX最適化＋広画面対応）
// - スマホ：従来どおり fixed / Portal
// - 広画面：relative + sticky（書けない問題解消）
// =======================================================

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";

import PoemTextarea from "./PoemTextarea";
import TitleInput from "./TitleInput";
import EmotionSelect from "../EmotionSelect";
import TagsInput from "./TagsInput";
import TitleCandidates from "./TitleCandidates";

import { savePoem, loadPoem } from "../../supabase/poemApi";
import { emotionPalette } from "../../styles/emotionPalette";

const DRAFT_KEY = "poem_draft_v1";

export default function PoemForm({
  poemId,
  theme,
  user,
  setLoading,
  onSaved,
  onTitleConfirmed,
}) {
  // =====================================================
  // device
  // =====================================================
  const isWide = window.innerWidth >= 768;

  // =====================================================
  // state
  // =====================================================
  const [title, setTitle] = useState("");
  const [poem, setPoem] = useState("");
  const [emotion, setEmotion] = useState("light");
  const [tags, setTags] = useState("");

  const [formDisabled, setFormDisabled] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  const [titleCandidates, setTitleCandidates] = useState([]);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  const [showSaveHint, setShowSaveHint] = useState(false);
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [showPastedToast, setShowPastedToast] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showSavedToast, setShowSavedToast] = useState(false);

  // =====================================================
  // refs
  // =====================================================
  const idleTimerRef = useRef(null);
  const idle5minRef = useRef(null);
  const pastedToastTimerRef = useRef(null);
  const draftToastTimerRef = useRef(null);

  // =====================================================
  // theme / palette
  // =====================================================
  const safeTheme = theme || "light";

  const palette = useMemo(() => {
    return (
      emotionPalette?.[emotion]?.[safeTheme] ||
      emotionPalette?.light?.light || {
        bg: "#fafafa",
        bg2: "#ffffff",
        text: "#111",
        border: "rgba(0,0,0,0.15)",
        primary: "#4b5cff",
        main: "#4b5cff",
        focusShadow: "rgba(75,92,255,0.25)",
      }
    );
  }, [emotion, safeTheme]);

  // =====================================================
  // body scroll lock（スマホのみ）
  // =====================================================
  useEffect(() => {
    if (isWide) return;

    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
    };
  }, [isWide]);

  // =====================================================
  // iOS viewport 揺れ対策（スマホのみ）
  // =====================================================
  useEffect(() => {
    if (isWide) return;

    const setVVH = () => {
      const vv = window.visualViewport;
      const h = vv?.height || window.innerHeight;
      document.documentElement.style.setProperty("--vvh", `${h}px`);
    };

    setVVH();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", setVVH);
      vv.addEventListener("scroll", setVVH);
    }
    window.addEventListener("resize", setVVH);

    return () => {
      if (vv) {
        vv.removeEventListener("resize", setVVH);
        vv.removeEventListener("scroll", setVVH);
      }
      window.removeEventListener("resize", setVVH);
    };
  }, [isWide]);

  // =====================================================
  // 下書き復元 / 保存
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
          setShowMeta(true);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPoem();
  }, [poemId, setLoading]);

  // =====================================================
  // 書き終わり検知
  // =====================================================
  useEffect(() => {
    if (!poem) {
      setShowSaveHint(false);
      return;
    }
    setShowSaveHint(false);
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (/[。．\n\s]$/.test(poem.trimEnd())) {
        setShowSaveHint(true);
      }
    }, 2500);
    return () => clearTimeout(idleTimerRef.current);
  }, [poem]);

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

    setSaveError("");
    setSaving(true);
    setFormDisabled(true);

    try {
      const ok = await savePoem(poemId, {
        title,
        poem,
        emotion,
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
      setFormDisabled(false);
    }
  };

  // =====================================================
  // JSX（Portalは維持）
  // =====================================================
  return createPortal(
    <>
      <div
        style={{
          position: isWide ? "relative" : "fixed",
          inset: isWide ? "auto" : 0,
          height: isWide ? "auto" : "var(--vvh, 100vh)",
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
            overflowY: "auto",
            padding: "1rem",
            paddingBottom: isWide
              ? "2rem"
              : "calc(12rem + env(safe-area-inset-bottom))",
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
              <EmotionSelect
                value={emotion}
                onChange={setEmotion}
                palette={palette}
              />
              <TagsInput value={tags} onChange={setTags} palette={palette} />
            </div>
          )}
        </div>

        <div
          style={{
            position: isWide ? "sticky" : "fixed",
            bottom: isWide ? 0 : "calc(0.75rem + env(safe-area-inset-bottom))",
            left: "0.75rem",
            right: "0.75rem",
            padding: "0.75rem",
            background: palette.bg2,
            borderRadius: "18px",
          }}
        >
          <button
            onClick={handleSave}
            disabled={formDisabled || saving || !user}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "14px",
              background: palette.main,
              color: "#fff",
              fontWeight: "bold",
              padding: "0.7rem",
              opacity: formDisabled || saving || !user ? 0.6 : 1,
            }}
          >
            {!user
              ? "ログインが必要です"
              : saving
              ? "保存しています…"
              : "保存する"}
          </button>

          {saveError && (
            <div
              style={{
                marginTop: "0.6rem",
                color: "#d33",
                fontSize: "0.85rem",
                textAlign: "center",
              }}
            >
              {saveError}
            </div>
          )}
        </div>
      </div>

      {showSavedToast && (
        <div
          style={{
            position: "fixed",
            bottom: "calc(8rem + env(safe-area-inset-bottom))",
            left: "50%",
            transform: "translateX(-50%)",
            background: palette.bg2,
            padding: "0.6rem 1rem",
            borderRadius: "18px",
            fontSize: "0.85rem",
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
