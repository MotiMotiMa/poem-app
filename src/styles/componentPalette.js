// src/styles/componentPalette.js

export const componentPalette = {
  tagPill: (palette) => ({
    bg: palette.inputBg,
    border: palette.border,
    text: palette.text,
    hover: palette.hover,
  }),

  submitButton: (palette) => ({
    bg: palette.primary,
    success: palette.success,
    text: palette.buttonText || "#fff",
    glowColor: palette.glowColor,
    spinnerTrack: palette.spinnerTrack,
    spinnerHead: palette.spinnerHead,
  }),

  card: (palette) => ({
    bgTop: palette.bg,
    bgBottom: palette.inputBg,
    text: palette.text,
    border: palette.border,
  }),
};
