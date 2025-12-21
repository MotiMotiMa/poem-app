import { useEffect, useRef, useState, useMemo } from "react";

export default function PoemComment({ comment, poemText, palette }) {
  // ---------- state ----------
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // ---------- refs ----------
  const triggerRef = useRef(null);
  const observerRef = useRef(null);
  const delayTimerRef = useRef(null);

  // ---------- device判定 ----------
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  // ---------- 詩の長さから余韻ディレイ算出 ----------
  const delayMs = useMemo(() => {
    if (!poemText) return 800;

    const length = poemText.length;
    const minDelay = 400;
    const maxDelay = 1400;
    const maxLength = 800;

    const ratio = Math.min(length / maxLength, 1);
    return Math.round(minDelay + ratio * (maxDelay - minDelay));
  }, [poemText]);

  // ---------- IntersectionObserver ----------
  useEffect(() => {
    if (!comment || dismissed || !triggerRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          delayTimerRef.current = setTimeout(() => {
            setVisible(true);
          }, delayMs);
        }
      },
      { threshold: 1.0 }
    );

    observerRef.current.observe(triggerRef.current);

    return () => {
      observerRef.current?.disconnect();
      clearTimeout(delayTimerRef.current);
    };
  }, [comment, delayMs, dismissed]);

  if (!comment || dismissed) return null;

  return (
    <>
      {/* 詩の末尾トリガー */}
      <div ref={triggerRef} style={{ height: "1px" }} />

      {/* コメント本体 */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",

          marginTop: isMobile ? "2.2rem" : "3.5rem",
          marginBottom: isMobile ? "4.5rem" : "3rem",

          maxWidth: "560px",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "1rem",

          fontSize: "0.95rem",
          lineHeight: "1.7",

          /* ★ emotion 同期ポイント */
          color: palette?.subText || palette?.text || "#666",
          background: palette?.commentBg || "rgba(255,255,255,0.55)",
          borderRadius: "10px",
          backdropFilter: "blur(6px)",

          position: "relative",
        }}
      >
        {/* しまう（今回だけ） */}
        <button
          onClick={() => setDismissed(true)}
          style={{
            position: "absolute",
            top: "-1.8rem",
            right: "0",
            background: "transparent",
            border: "none",
            fontSize: "0.75rem",
            color: palette?.subText || "#999",
            cursor: "pointer",
            padding: 0,
          }}
        >
          しまう
        </button>

        <div style={{ pointerEvents: "none" }}>
          {comment}
        </div>
      </div>
    </>
  );
}
