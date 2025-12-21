// =======================================================
// PoemForm.jsx（最終完成形：iOS/編集画面の伸び縮み揺れ潰し込み）
// - Portal対応
// - 書き終わり検知 → 保存予告
// - evaluate-poem API 統合（タイトル生成 / 保存時再評価）
// - ESCキー対応（未保存ガード）
// - 自動保存ドラフト（localStorage）
// - 5分無操作でやさしい保存トースト
// - タイトル確定で親に通知（700ms後クローズ）
// - iOS viewport 揺れ対策（visualViewport + CSS var）
// - Portal中はbodyスクロール停止
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
  const idleTimerRef = useRef(null);
  const idle5minRef = useRef(null);
  const pastedToastTimerRef = useRef(null);
  const draftToastTimerRef = useRef(null);

  // ---------------- theme/emotion 安全化 ----------------
  const safeTheme = theme || "light";

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
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [showPastedToast, setShowPastedToast] = useState(false);

  // ---------------- palette 安定化 ----------------
  const palette = useMemo(() => {
    return (
      emotionPalette?.[emotion]?.[safeTheme] ||
      emotionPalette?.light?.light ||
      {
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
  // Portal表示中：bodyスクロール停止（iOSのガタつき抑制）
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
  // iOS viewport 揺れ対策：visualViewport → CSS変数
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

  // ---------------- 下書き復元 ----------------
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

  // ---------------- 自動ドラフト保存 ----------------
  useEffect(() => {
    if (poemId) return;
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ title, poem, emotion, tags })
    );
  }, [title, poem, emotion, tags, poemId]);

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
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (/[。．\n\s]$/.test(poem.trimEnd())) {
        setShowSaveHint(true);
      }
    }, 2500);
    return () => clearTimeout(idleTimerRef.current);
  }, [poem]);

  // ---------------- 5分無操作トースト ----------------
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

  // ---------------- ESCキー（未保存ガード） ----------------
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
  // タイトル生成（evaluate-poem：軽量利用）
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
      alert("タイトル生成に失敗しました");
      onTitleConfirmed?.(); // ★ 失敗でも区切りとして通す
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // =====================================================
  // タイトル確定（即）
  // =====================================================
  const handlePickTitle = (picked) => {
    setTitle(picked);
    onTitleConfirmed?.();
  };

  // =====================================================
  // 保存（evaluate-poem：本評価）
  // =====================================================
 const handleSave = async () => {
  if (!user) return alert("ログインが必要です");
  if (!poem.trim()) return alert("本文が空です");

  setFormDisabled(true);
  setLoading(true);
  setShowSaveHint(false);

  let evalData = null;

  try {
    // --- AI評価は「あれば使う」 ---
    const evalRes = await fetch("/api/evaluate-poem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ poem }),
    });

    if (evalRes.ok) {
      evalData = await evalRes.json();
    }
  } catch (e) {
    // 何もしない（AI失敗は許容）
    console.warn("AI評価スキップ", e);
  }

  try {
    // --- 保存は必ず実行 ---
    const ok = await savePoem(poemId, {
      title,
      poem,
      score: evalData?.score ?? null,
      comment: evalData?.comment ?? "",
      emotion: evalData?.emotion || emotion,
      tags: evalData?.tags || tags.split(",").map(t => t.trim()).filter(Boolean),
      status: poemId
        ? evalData ? "再評価されました" : "保存されました"
        : evalData ? "新規評価されました" : "下書き保存されました",
    });

    if (!ok) {
      alert("保存できませんでした");
      return;
    }

    localStorage.removeItem(DRAFT_KEY);
    onSaved?.();
  } finally {
    setLoading(false);
    setFormDisabled(false);
  }
};


  // ---------------- JSX（Portal） ----------------
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
          overscrollBehavior: "none",
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
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
              display: "flex",
              gap: "0.75rem",
              zIndex: 10000,
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
                cursor: "pointer",
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
            zIndex: 10000,
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
              cursor: formDisabled || !user ? "not-allowed" : "pointer",
              opacity: formDisabled || !user ? 0.6 : 1,
            }}
          >
            {!user ? "ログインが必要です" : "保存する"}
          </button>
        </div>
      </div>

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
            opacity: 0.92,
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
