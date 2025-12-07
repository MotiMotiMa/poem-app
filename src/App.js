import { Routes, Route } from "react-router-dom";
import PoemListPage from "./pages/PoemListPage";
import EditPage from "./pages/EditPage";
import PoemViewPage from "./pages/PoemViewPage";
import { useState, useEffect } from "react";

function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  return (
    <>
      <button
        onClick={toggleTheme}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 999,
          padding: "0.6rem 1rem",
          borderRadius: "8px",
          background: theme === "dark" ? "#444" : "#ddd",
          border: "none",
          cursor: "pointer",
        }}
      >
        {theme === "light" ? "🌙 ダーク" : "🌞 ライト"}
      </button>

      <Routes>
        <Route path="/" element={<PoemListPage theme={theme} />} />
        <Route path="/edit/:id" element={<EditPage theme={theme} />} />
        <Route path="/poem/:id" element={<PoemViewPage theme={theme} />} />
      </Routes>
    </>
  );
}


export default App;
