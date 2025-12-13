// =======================================================
// PoemTextarea.jsx
// - 詩人モード（行末余白）
// - 薄い行番号
// - 現在行ハイライト
// - 行末フェードアウト（視線誘導）
// - IME / iOS 安全
// =======================================================

import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
} from "react";

export default function PoemTextarea({
  value,
  onChange,
  palette,
  autoFocus,
  poetMode = false,
}) {
  const textareaRef = useRef(null);
  const composingRef = useRef(false);

  const [currentLine, setCurrentLine] = useState(1);

  // 行配列
  const lines = useMemo(() => {
    const count = value.split("\n").length;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [value]);

  // 現在行計算
  const updateCurrentLine = () => {
    const el = textareaRef.current;
    if (!el) return;

    const pos = el.selectionStart || 0;
    const before = el.value.slice(0, pos);
    setCurrentLine(before.split("\n").length);
  };

  // 高さ自動調整（IME中は除外）
  useEffect(() => {
    const el = textareaRef.current;
    if (!el || composingRef.current) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div
      style={{
        display: "flex",
        marginBottom: "1.2rem",
        position: "relative",
      }}
    >
      {/* ---------- 行番号 ---------- */}
      {poetMode && (
        <div
          style={{
            paddingTop: "1.1rem",
            paddingLeft: "0.5rem",
            paddingRight: "0.4rem",
            textAlign: "right",
            userSelect: "none",
            pointerEvents: "none",
            fontFamily: "'YuMincho', serif",
            fontSize: "0.75rem",
            lineHeight: "1.85",
            color: palette.text,
            opacity: 0.25,
          }}
        >
          {lines.map((n) => (
            <div key={n}>{n}</div>
          ))}
        </div>
      )}

      {/* ---------- テキストエリアラッパー ---------- */}
      <div style={{ position: "relative", flex: 1 }}>
        {/* 現在行ハイライト */}
        {poetMode && (
          <div
            style={{
              position: "absolute",
              top: `calc(${currentLine - 1} * 1.85em + 1.1rem)`,
              left: 0,
              right: "30%",
              height: "1.85em",
              background: palette.primary,
              opacity: 0.06,
              borderRadius: "6px",
              pointerEvents: "none",
              transition: "top 0.12s ease",
              zIndex: 0,
            }}
          />
        )}

        {/* 行末フェードアウト */}
        {poetMode && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "30%",
              height: "100%",
              background: `linear-gradient(
                to right,
                rgba(0,0,0,0),
                ${palette.bg} 70%
              )`,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}

        <textarea
          ref={textareaRef}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onClick={updateCurrentLine}
          onKeyUp={updateCurrentLine}
          onFocus={updateCurrentLine}
          placeholder="ここに詩を書き始めてください…"
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={(e) => {
            composingRef.current = false;
            onChange(e.target.value);
            updateCurrentLine();
          }}
          style={{
            position: "relative",
            width: "100%",
            minHeight: "45vh",

            paddingTop: "1.1rem",
            paddingBottom: "1.1rem",
            paddingLeft: poetMode ? "0.8rem" : "1.2rem",
            paddingRight: poetMode ? "30%" : "1.2rem",

            fontSize: "1.05rem",
            fontFamily: "'YuMincho', serif",
            lineHeight: "1.85",
            letterSpacing: "0.04em",

            background: "transparent",
            color: palette.text,
            border: `1px solid ${palette.border}`,
            borderRadius: "14px",

            resize: "none",
            overflow: "hidden",
            outline: "none",

            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            WebkitOverflowScrolling: "touch",

            zIndex: 2,
          }}
          onFocus={(e) => {
            e.target.style.border = `1px solid ${palette.primary}`;
            e.target.style.boxShadow = `0 0 0 3px ${palette.focusShadow}`;
          }}
          onBlur={(e) => {
            e.target.style.border = `1px solid ${palette.border}`;
            e.target.style.boxShadow = "none";
          }}
        />
      </div>
    </div>
  );
}
