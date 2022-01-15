import { AddStitchesTokenPrefix } from "../stitches.config";

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

const dark = {
  dark50: "#c1c2c5",
  dark100: "#a6a7ab",
  dark200: "#909296",
  dark300: "#5c5f66",
  dark400: "#373a40",
  dark500: "#2c2e33",
  dark600: "#25262b",
  dark700: "#1a1b1e",
  dark800: "#141517",
  dark900: "#101113",
};

const neutral = {
  neutral50: "#f9fafb",
  neutral100: "#f3f4f6",
  neutral200: "#e5e7eb",
  neutral300: "#d1d5db",
  neutral400: "#9ca3af",
  neutral500: "#6b7280",
  neutral600: "#4b5563",
  neutral700: "#374151",
  neutral800: "#1f2937",
  neutral900: "#111827",
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
  ...primary,
  ...dark,
  ...neutral,
  ...success,
  ...info,
  ...warning,
  ...danger,
};

export type ColorTokens = AddStitchesTokenPrefix<keyof typeof colors>;
