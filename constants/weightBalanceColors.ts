// Shared palette for the Weight Balance (sample-weighing) screen and its
// form controls (searchable-select, radio-group/segmented-control, date
// picker). Named distinctly from constants/Colors.ts (a separate, unrelated,
// currently-unused Expo-template file) rather than "colors.ts" — Windows'
// filesystem is case-insensitive, so a lowercase "colors.ts" would collide
// with the existing "Colors.ts" and silently overwrite/shadow it.
export const colors = {
  primary: "#4f46e5",
  primaryDark: "#4338ca",
  primaryLight: "#eef2ff",

  background: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  borderSoft: "#f1f5f9",

  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",

  success: "#16a34a",
  successSoft: "#dcfce7",
  danger: "#ef4444",
  warning: "#d97706",

  // Dark card (Live Balance Feed) — separate from the light surface above.
  dark: {
    background: "#0f172a",
    border: "#1e293b",
    textPrimary: "#f1f5f9",
    textMuted: "#94a3b8",
    success: "#4ade80",
    danger: "#f87171",
  },

  // Rotating accent per weight slot (W1-W4) for quick visual distinction.
  slotAccents: ["#4f46e5", "#0ea5e9", "#f59e0b", "#ec4899"],
};
