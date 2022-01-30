const common = {
  transparent: "transparent",
  current: "currentColor",
  white: "#ffffff",
  black: "#000000",
};

const whiteAlpha = {
  whiteAlpha50: "rgba(255, 255, 255, 0.04)",
  whiteAlpha100: "rgba(255, 255, 255, 0.06)",
  whiteAlpha200: "rgba(255, 255, 255, 0.08)",
  whiteAlpha300: "rgba(255, 255, 255, 0.16)",
  whiteAlpha400: "rgba(255, 255, 255, 0.24)",
  whiteAlpha500: "rgba(255, 255, 255, 0.36)",
  whiteAlpha600: "rgba(255, 255, 255, 0.48)",
  whiteAlpha700: "rgba(255, 255, 255, 0.64)",
  whiteAlpha800: "rgba(255, 255, 255, 0.80)",
  whiteAlpha900: "rgba(255, 255, 255, 0.92)",
};

const blackAlpha = {
  blackAlpha50: "rgba(0, 0, 0, 0.04)",
  blackAlpha100: "rgba(0, 0, 0, 0.06)",
  blackAlpha200: "rgba(0, 0, 0, 0.08)",
  blackAlpha300: "rgba(0, 0, 0, 0.16)",
  blackAlpha400: "rgba(0, 0, 0, 0.24)",
  blackAlpha500: "rgba(0, 0, 0, 0.36)",
  blackAlpha600: "rgba(0, 0, 0, 0.48)",
  blackAlpha700: "rgba(0, 0, 0, 0.64)",
  blackAlpha800: "rgba(0, 0, 0, 0.80)",
  blackAlpha900: "rgba(0, 0, 0, 0.92)",
};

const primary = {
  primary50: "#eff6ff",
  primary100: "#dbeafe",
  primary200: "#bfdbfe",
  primary300: "#93c5fd",
  primary400: "#60a5fa",
  primary500: "#3b82f6",
  primary600: "#2563eb",
  primary700: "#1d4ed8",
  primary800: "#1e40af",
  primary900: "#1e3a8a",
};

const neutral = {
  neutral50: "#F7FAFC",
  neutral100: "#EDF2F7",
  neutral200: "#E2E8F0",
  neutral300: "#CBD5E0",
  neutral400: "#A0AEC0",
  neutral500: "#718096",
  neutral600: "#4A5568",
  neutral700: "#2D3748",
  neutral800: "#1A202C",
  neutral900: "#171923",
};

const success = {
  success50: "#ecfdf5",
  success100: "#d1fae5",
  success200: "#a7f3d0",
  success300: "#6ee7b7",
  success400: "#34d399",
  success500: "#10b981",
  success600: "#059669",
  success700: "#047857",
  success800: "#065f46",
  success900: "#064e3b",
};

const info = {
  info50: "#f0f9ff",
  info100: "#e0f2fe",
  info200: "#bae6fd",
  info300: "#7dd3fc",
  info400: "#38bdf8",
  info500: "#0ea5e9",
  info600: "#0284c7",
  info700: "#0369a1",
  info800: "#075985",
  info900: "#0c4a6e",
};

const warning = {
  warning50: "#fffbeb",
  warning100: "#fef3c7",
  warning200: "#fde68a",
  warning300: "#fcd34d",
  warning400: "#fbbf24",
  warning500: "#f59e0b",
  warning600: "#d97706",
  warning700: "#b45309",
  warning800: "#92400e",
  warning900: "#78350f",
};

const danger = {
  danger50: "#fef2f2",
  danger100: "#fee2e2",
  danger200: "#fecaca",
  danger300: "#fca5a5",
  danger400: "#f87171",
  danger500: "#ef4444",
  danger600: "#dc2626",
  danger700: "#b91c1c",
  danger800: "#991b1b",
  danger900: "#7f1d1d",
};

export const colors = {
  ...common,
  ...whiteAlpha,
  ...blackAlpha,
  ...primary,
  ...neutral,
  ...success,
  ...info,
  ...warning,
  ...danger,
};
