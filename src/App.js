// ===============================================
// App.js（OSテーマ自動追従 + Router管理 + Loading一元化）
// ===============================================
import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import PoemListPage from "./pages/PoemListPage";
import EditPage from "./pages/EditPage";
import PoemViewPage from "./pages/PoemViewPage";

import { getTheme } from "./theme";

function App() {
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------
  // OS のライト/ダーク設定を読み取り state に保持
  // -----------------------------------------------
  const [mode, setMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );

  // -----------------------------------------------
  // OS のテーマ変更をリアルタイム検知
  // -----------------------------------------------
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = (e) => {
      setMode(e.matches ? "dark" : "light");
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const theme = getTheme(mode);

  return (
    <div
      style={{
        background: theme.bg,
        minHeight: "100vh",
        color: theme.text,
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      {/* ======================================
          Loading Overlay（親一元管理）
         ====================================== */}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              background: theme.bg,
              color: theme.text,
              fontSize: "0.95rem",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            処理中…
          </div>
        </div>
      )}

      {/* ======================================
          Routes
         ====================================== */}
      <Routes>
        <Route
          path="/"
          element={<PoemListPage theme={mode} setLoading={setLoading} />}
        />
        <Route
          path="/edit/:id"
          element={<EditPage theme={mode} setLoading={setLoading} />}
        />
        <Route
          path="/view/:id"
          element={<PoemViewPage theme={mode} setLoading={setLoading} />}
        />
      </Routes>
    </div>
  );
}

export default App;
