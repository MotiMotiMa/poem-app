// ===============================================
// App.js（OSテーマ自動追従 + Router削除版 完全版）
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
  // OS のテーマ変更（light ↔ dark）をリアルタイム検知
  // -----------------------------------------------
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = (e) => {
      setMode(e.matches ? "dark" : "light");
    };

    mq.addEventListener("change", handler);

    // クリーンアップ
    return () => mq.removeEventListener("change", handler);
  }, []);

  // -----------------------------------------------
  // 現在のモードに対応したテーマオブジェクトを生成
  // -----------------------------------------------
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
      {/* ローディングUI（そのまま） */}

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
