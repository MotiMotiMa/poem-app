import React, { useState, useMemo } from "react";
import { Routes, Route } from "react-router-dom";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import PoemListPage from "./pages/PoemListPage";
import EditPage from "./pages/EditPage";
import PoemViewPage from "./pages/PoemViewPage";

function App() {
  const [mode, setMode] = useState("light");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: { default: "#fafafa", paper: "#ffffff" },
          text: { primary: "#000000" },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 1000 }}>
        <IconButton onClick={() => setMode(mode === "light" ? "dark" : "light")}>
          {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </div>
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <h1>🌈 詩作成システム</h1>
      </div>

      <Routes>
        <Route path="/" element={<PoemListPage theme={mode} />} />
        <Route path="/edit/:id" element={<EditPage theme={mode} />} />
        <Route path="/poem/:id" element={<PoemViewPage theme={mode} />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
