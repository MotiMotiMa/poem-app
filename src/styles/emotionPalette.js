// =======================================================
// emotionPalette.js（全7感情 × 2テーマ / 完全デザイン版）
// =======================================================

import { baseThemePalette } from "./baseThemePalette";

export const emotionPalette = {
  // -----------------------------
  // 1. 光 / Light
  // -----------------------------
  light: {
    light: {
      ...baseThemePalette.light,
      primary: "#2980b9",
      accent: "#74b9ff",
      bg2: "#ffffff",
      glowColor: "rgba(255,255,255,0.8)",
      spinnerTrack: "rgba(255,255,255,0.4)",
      spinnerHead: "#2980b9",
      shadow: "rgba(0,0,0,0.15)",
    },
    dark: {
      ...baseThemePalette.dark,
      primary: "#4aa3ff",
      accent: "#74b9ff",
      bg2: "#222",
      glowColor: "rgba(255,255,255,0.4)",
      spinnerTrack: "rgba(255,255,255,0.25)",
      spinnerHead: "#4aa3ff",
      shadow: "rgba(0,0,0,0.6)",
    },
  },

  // -----------------------------
  // 2. 闇 / Dark
  // -----------------------------
  dark: {
    light: {
      ...baseThemePalette.light,
      primary: "#2c3e50",
      accent: "#4e6580",
      bg2: "#e9eef3",
      glowColor: "rgba(44,62,80,0.25)",
      spinnerTrack: "rgba(0,0,0,0.3)",
      spinnerHead: "#2c3e50",
      shadow: "rgba(0,0,0,0.2)",
    },
    dark: {
      ...baseThemePalette.dark,
      primary: "#000000",
      accent: "#2c3e50",
      bg2: "#111",
      glowColor: "rgba(255,255,255,0.2)",
      spinnerTrack: "rgba(255,255,255,0.2)",
      spinnerHead: "#fff",
      shadow: "rgba(0,0,0,0.7)",
    },
  },

  // -----------------------------
  // 3. 温 / Warm
  // -----------------------------
  warm: {
    light: {
      ...baseThemePalette.light,
      primary: "#e67e22",
      accent: "#f5b97a",
      bg2: "#fff4e8",
      glowColor: "rgba(255,180,120,0.4)",
      spinnerTrack: "rgba(255,200,150,0.4)",
      spinnerHead: "#e67e22",
      shadow: "rgba(200,100,50,0.25)",
    },
    dark: {
      ...baseThemePalette.dark,
      primary: "#b65c12",
      accent: "#e29b63",
      bg2: "#2d241e",
      glowColor: "rgba(255,150,80,0.3)",
      spinnerTrack: "rgba(255,150,80,0.25)",
      spinnerHead: "#e29b63",
      shadow: "rgba(0,0,0,0.6)",
    },
  },

  // -----------------------------
  // 4. 冷 / Cool
  // -----------------------------
  cool: {
    light: {
      ...baseThemePalette.light,
      primary: "#74b9ff",
      accent: "#a8d0ff",
      bg2: "#eef6ff",
      glowColor: "rgba(120,180,255,0.4)",
      spinnerTrack: "rgba(0,120,255,0.25)",
      spinnerHead: "#74b9ff",
      shadow: "rgba(0,0,0,0.15)",
    },
    dark: {
      ...baseThemePalette.dark,
      primary: "#4a6fa8",
      accent: "#7ea3d4",
      bg2: "#1f2833",
      glowColor: "rgba(120,160,255,0.25)",
      spinnerTrack: "rgba(255,255,255,0.2)",
      spinnerHead: "#7ea3d4",
      shadow: "rgba(0,0,0,0.7)",
    },
  },

  // -----------------------------
  // 5. 愛 / Love
  // -----------------------------
  love: {
    light: {
      ...baseThemePalette.light,
      primary: "#ff6fb1",
      accent: "#ff9fcf",
      bg2: "#ffe6f1",
      glowColor: "rgba(255,120,180,0.4)",
      spinnerTrack: "rgba(255,120,180,0.35)",
      spinnerHead: "#ff6fb1",
      shadow: "rgba(255,100,150,0.28)",
    },
    dark: {
      ...baseThemePalette.dark,
      primary: "#b83c6f",
      accent: "#ff7fb6",
      bg2: "#2a1c26",
      glowColor: "rgba(255,120,180,0.25)",
      spinnerTrack: "rgba(255,120,180,0.2)",
      spinnerHead: "#ff7fb6",
      shadow: "rgba(0,0,0,0.7)",
    },
  },

  // -----------------------------
  // 6. 哀 / Sorrow
  // -----------------------------
  sorrow: {
    light: {
      ...baseThemePalette.light,
      primary: "#6c5ce7",
      accent: "#a29bfe",
      bg2: "#ecebff",
      glowColor: "rgba(150,150,255,0.35)",
      spinnerTrack: "rgba(100,100,255,0.25)",
      spinnerHead: "#6c5ce7",
      shadow: "rgba(0,0,0,0.18)",
    },
    dark: {
      ...baseThemePalette.dark,
      primary: "#3f3a7c",
      accent: "#8f88ff",
      bg2: "#1d1b33",
      glowColor: "rgba(150,150,255,0.2)",
      spinnerTrack: "rgba(255,255,255,0.2)",
      spinnerHead: "#8f88ff",
      shadow: "rgba(0,0,0,0.65)",
    },
  },

  // -----------------------------
  // 7. 芽 / Growth
  // -----------------------------
  growth: {
    light: {
      ...baseThemePalette.light,
      primary: "#55efc4",
      accent: "#81ffd8",
      bg2: "#e9fff7",
      glowColor: "rgba(100,255,200,0.45)",
      spinnerTrack: "rgba(100,255,200,0.3)",
      spinnerHead: "#55efc4",
      shadow: "rgba(0,0,0,0.18)",
    },
    dark: {
      ...baseThemePalette.dark,
      primary: "#00b894",
      accent: "#55efc4",
      bg2: "#0f2d25",
      glowColor: "rgba(100,255,200,0.25)",
      spinnerTrack: "rgba(255,255,255,0.2)",
      spinnerHead: "#55efc4",
      shadow: "rgba(0,0,0,0.7)",
    },
  },
};
