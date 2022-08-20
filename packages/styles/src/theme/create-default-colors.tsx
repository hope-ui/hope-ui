/*!
 * Colors from TailwindCSS
 * MIT Licensed, Copyright (c) Tailwind Labs, Inc.
 *
 * Credits to the Tailwind Labs team:
 * https://github.com/tailwindlabs/tailwindcss/blob/master/src/public/colors.js
 */

import { ThemeColors } from "../types";
import { createGetCssVar } from "../utils";
import { createDarkPalette, createMediumPalette, createVeryBrightPalette } from "./create-palette";

// Tailwind blue
const [primary, primaryDark] = createMediumPalette({
  50: "#eff6ff",
  100: "#dbeafe",
  200: "#bfdbfe",
  300: "#93c5fd",
  400: "#60a5fa",
  500: "#3b82f6",
  600: "#2563eb",
  700: "#1d4ed8",
  800: "#1e40af",
  900: "#1e3a8a",
});

// Tailwind gray
const [neutral, neutralDark] = createDarkPalette({
  50: "#f9fafb",
  100: "#f3f4f6",
  200: "#e5e7eb",
  300: "#d1d5db",
  400: "#9ca3af",
  500: "#6b7280",
  600: "#4b5563",
  700: "#374151",
  800: "#1f2937",
  900: "#111827",
});

// Tailwind green
const [success, successDark] = createVeryBrightPalette({
  50: "#f0fdf4",
  100: "#dcfce7",
  200: "#bbf7d0",
  300: "#86efac",
  400: "#4ade80",
  500: "#22c55e",
  600: "#16a34a",
  700: "#15803d",
  800: "#166534",
  900: "#14532d",
});

// Tailwind purple
const [info, infoDark] = createMediumPalette({
  50: "#faf5ff",
  100: "#f3e8ff",
  200: "#e9d5ff",
  300: "#d8b4fe",
  400: "#c084fc",
  500: "#a855f7",
  600: "#9333ea",
  700: "#7e22ce",
  800: "#6b21a8",
  900: "#581c87",
});

// Tailwind yellow
const [warning, warningDark] = createVeryBrightPalette({
  50: "#fefce8",
  100: "#fef9c3",
  200: "#fef08a",
  300: "#fde047",
  400: "#facc15",
  500: "#eab308",
  600: "#ca8a04",
  700: "#a16207",
  800: "#854d0e",
  900: "#713f12",
});

// Tailwind red
const [danger, dangerDark] = createMediumPalette({
  50: "#fef2f2",
  100: "#fee2e2",
  200: "#fecaca",
  300: "#fca5a5",
  400: "#f87171",
  500: "#ef4444",
  600: "#dc2626",
  700: "#b91c1c",
  800: "#991b1b",
  900: "#7f1d1d",
});

export function createDefaultColors(cssVarPrefix: string): ThemeColors {
  const getCssVar = createGetCssVar(cssVarPrefix);

  return {
    light: {
      primary: primary("primary", cssVarPrefix),
      neutral: neutral("neutral", cssVarPrefix),
      success: success("success", cssVarPrefix),
      info: info("info", cssVarPrefix),
      warning: warning("warning", cssVarPrefix),
      danger: danger("danger", cssVarPrefix),
      common: {
        white: "#ffffff",
        black: "#000000",
        divider: getCssVar("colors-neutral-200"),
        focusRing: getCssVar("colors-primary-500"),
      },
      text: {
        primary: getCssVar("colors-neutral-800"),
        secondary: getCssVar("colors-neutral-600"),
        tertiary: getCssVar("colors-neutral-500"),
      },
      background: {
        body: getCssVar("colors-common-white"),
        surface0: getCssVar("colors-common-white"),
        surface1: getCssVar("colors-neutral-50"),
        surface2: getCssVar("colors-neutral-100"),
        surface3: getCssVar("colors-neutral-200"),
        tooltip: getCssVar("colors-neutral-800"),
      },
    },
    dark: {
      primary: primaryDark("primary", cssVarPrefix),
      neutral: neutralDark("neutral", cssVarPrefix),
      success: successDark("success", cssVarPrefix),
      info: infoDark("info", cssVarPrefix),
      warning: warningDark("warning", cssVarPrefix),
      danger: dangerDark("danger", cssVarPrefix),
      common: {
        white: "#ffffff",
        black: "#0a0a0a", // very dark neutral gray, do not use pure black.
        divider: getCssVar("colors-neutral-800"),
        focusRing: getCssVar("colors-primary-500"),
      },
      text: {
        primary: getCssVar("colors-neutral-100"),
        secondary: getCssVar("colors-neutral-300"),
        tertiary: getCssVar("colors-neutral-400"),
      },
      background: {
        body: getCssVar("colors-neutral-900"),
        surface0: getCssVar("colors-neutral-900"),
        surface1: getCssVar("colors-neutral-800"),
        surface2: getCssVar("colors-neutral-700"),
        surface3: getCssVar("colors-neutral-600"),
        tooltip: getCssVar("colors-neutral-600"),
      },
    },
  };
}
