// =======================================================
// PoemForm.jsx（完成版：UX最適化・保存フィードバック・粒度ローディング）
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
  // state
  // =====================================================
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
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [showPastedToast, setShowPastedToast] = useState(false);

  // --- UX feedback ---
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
  // mount / unmount log（デバッグ用・残してOK）
  // =====================================================
  useEffect(() => {
    console.log("PoemForm mount");
    return () => console.log("PoemForm unmount");
  }, []);

  // =====================================================
  // body scroll lock（Portal表示中）
  // =====================================================
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
    };
  }, []);

  // =====================================================
  // iOS viewport 揺れ対策
  // =====================================================
  useEffect(() => {
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
  }, []);

  // =====================================================
  // 下書き復元（新規時のみ）
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

  // =====================================================
  // 自動ドラフト保存
  // =====================================================
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

  // =====================================================
  // 書き終わり検知（保存ヒント）
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
  // 5分無操作トースト
  // =====================================================
  useEffect(() => {
    if (poemId) return;

    clearTimeout(idle5minRef.current);
    idle5minRef.current = setTimeout(() => {
      if (poem || title || tags) {
        setShowDraftToast(true);
        clearTimeout(draftToastTimerRef.current);
        draftToastTimerRef.current = setTimeout(() => {
          setShowDraftToast(false);
        }, 4000);
      }
    }, 5 * 60 * 1000);

    return () => {
      clearTimeout(idle5minRef.current);
      clearTimeout(draftToastTimerRef.current);
    };
  }, [poem, title, tags, poemId]);

  // =====================================================
  // ESCキー（未保存ガード）
  // =====================================================
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (poem || title || tags) {
        if (!window.confirm("未保存の内容があります。閉じますか？")) return;
      }
      onSaved?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [poem, title, tags, onSaved]);

  // =====================================================
  // タイトル生成
  // =====================================================
  const generateTitle = async () => {
    if (!poem.trim()) return;

    setIsGeneratingTitle(true);
    try {
      const res = await fetch("/api/evaluate-poem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poem }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      setTitleCandidates(data.titles || []);
      if (data.emotion) setEmotion(data.emotion);
      if (!tags && Array.isArray(data.tags)) {
        setTags(data.tags.join(","));
      }
      setShowMeta(true);
    } catch {
      setSaveError("タイトル生成に失敗しました");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handlePickTitle = (picked) => {
    setTitle(picked);
    onTitleConfirmed?.();
  };

  // =====================================================
  // 保存処理（UX最適化）
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
    setShowSaveHint(false);

    let evalData = null;

    try {
      const evalRes = await fetch("/api/evaluate-poem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poem }),
      });
      if (evalRes.ok) evalData = await evalRes.json();
    } catch {}

    try {
      const ok = await savePoem(poemId, {
        title,
        poem,
        score: evalData?.score ?? null,
        comment: evalData?.comment ?? "",
        emotion: evalData?.emotion || emotion,
        tags: evalData?.tags || tags.split(",").map(t => t.trim()).filter(Boolean),
      });

      if (!ok) {
        setSaveError("保存に失敗しました。もう一度お試しください。");
        return;
      }

      localStorage.removeItem(DRAFT_KEY);
      setShowSavedToast(true);

      setTimeout(() => {
        onSaved?.();
      }, 900);
    } catch (e) {
      console.error(e);
      setSaveError("予期しないエラーが発生しました。");
    } finally {
      setSaving(false);
      setFormDisabled(false);
    }
  };

  // =====================================================
  // JSX（Portal）
  // =====================================================
  return createPortal(
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          height: "var(--vvh, 100vh)",
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
            paddingBottom: "calc(12rem + env(safe-area-inset-bottom))",
          }}
        >
          <PoemTextarea
            value={poem}
            onChange={setPoem}
            palette={palette}
            autoFocus
            poetMode
            onPasteDetected={() => {
              setShowPastedToast(true);
              clearTimeout(pastedToastTimerRef.current);
              pastedToastTimerRef.current = setTimeout(() => {
                setShowPastedToast(false);
              }, 1500);
            }}
          />

          {showMeta && (
            <div style={{ marginTop: "1.5rem" }}>
              <TitleInput value={title} onChange={setTitle} palette={palette} />

              <TitleCandidates
                titleCandidates={titleCandidates}
                onPick={handlePickTitle}
                colors={{
                  candidateBg: palette.bg2,
                  text: palette.text,
                  label: palette.text,
                }}
                emotion={emotion}
              />

              <EmotionSelect
                value={emotion}
                onChange={setEmotion}
                palette={palette}
              />
              <TagsInput value={tags} onChange={setTags} palette={palette} />
            </div>
          )}
        </div>

        {showSaveHint && (
          <div
            style={{
              position: "fixed",
              bottom: "calc(6.5rem + env(safe-area-inset-bottom))",
              left: "50%",
              transform: "translateX(-50%)",
              background: palette.bg2,
              padding: "0.6rem 1rem",
              borderRadius: "16px",
            }}
          >
            <span>ひと区切りつきました</span>
            <button
              onClick={generateTitle}
              disabled={isGeneratingTitle}
              style={{
                marginLeft: "0.75rem",
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

        <div
          style={{
            position: "fixed",
            left: "0.75rem",
            right: "0.75rem",
            bottom: "calc(0.75rem + env(safe-area-inset-bottom))",
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

      {showPastedToast && (
        <div
          style={{
            position: "fixed",
            bottom: "calc(11.2rem + env(safe-area-inset-bottom))",
            left: "50%",
            transform: "translateX(-50%)",
            background: palette.bg2,
            padding: "0.55rem 0.9rem",
            borderRadius: "18px",
            fontSize: "0.8rem",
            zIndex: 10001,
          }}
        >
          貼り付けました
        </div>
      )}

      {showDraftToast && (
        <div
          style={{
            position: "fixed",
            bottom: "calc(9.5rem + env(safe-area-inset-bottom))",
            left: "50%",
            transform: "translateX(-50%)",
            background: palette.bg2,
            padding: "0.6rem 1rem",
            borderRadius: "18px",
            fontSize: "0.8rem",
            zIndex: 10001,
          }}
        >
          下書きは自動で守られています
        </div>
      )}
    </>,
    document.body
  );
}
