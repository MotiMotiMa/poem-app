// ===============================================
// App.js（OAuthリダイレクト完全対応版）
// ===============================================
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import PoemListPage from "./pages/PoemListPage";
import EditPage from "./pages/EditPage";
import PoemViewPage from "./pages/PoemViewPage";

import supabase from "./supabaseClient";
import { getTheme } from "./theme";

function App() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // OSテーマ
  const [mode, setMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setMode(e.matches ? "dark" : "light");
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
      }}
    >
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
          }}
        >
          <div
            style={{
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              background: theme.bg,
              color: theme.text,
            }}
          >
            処理中…
          </div>
        </div>
      )}

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
