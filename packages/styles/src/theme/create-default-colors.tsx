/*!
 * Colors from TailwindCSS
 * MIT Licensed, Copyright (c) Tailwind Labs, Inc.
 *
 * Credits to the Tailwind Labs team:
 * https://github.com/tailwindlabs/tailwindcss/blob/master/src/public/colors.js
 *
 * Colors from Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/theme/src/foundations/colors.ts
 */

import { PaletteScale, ThemeColors } from "../types";
import { createGetCssVar } from "../utils/css-var";
import { createPalette } from "./create-palette";

const primary = createPalette({
  50: "#e6f6ff",
  100: "#bae3ff",
  200: "#7cc4fa",
  300: "#47a3f3",
  400: "#2186eb",
  500: "#0967d2",
  600: "#0552b5",
  700: "#03449e",
  800: "#01337d",
  900: "#002159",
});

const neutral = createPalette({
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

const success = createPalette({
  50: "#e3f9e5",
  100: "#c1eac5",
  200: "#a3d9a5",
  300: "#7bc47f",
  400: "#57ae5b",
  500: "#3f9142",
  600: "#2f8132",
  700: "#207227",
  800: "#0e5814",
  900: "#05400a",
});

const info = createPalette({
  50: "#eae2f8",
  100: "#cfbcf2",
  200: "#a081d9",
  300: "#8662c7",
  400: "#724bb7",
  500: "#653cad",
  600: "#51279b",
  700: "#421987",
  800: "#34126f",
  900: "#240754",
});

const warning = createPalette({
  50: "#fffbea",
  100: "#fff3c4",
  200: "#fce588",
  300: "#fadb5f",
  400: "#f7c948",
  500: "#f0b429",
  600: "#de911d",
  700: "#cb6e17",
  800: "#b44d12",
  900: "#8d2b0b",
});

const danger = createPalette({
  50: "#ffe3e3",
  100: "#ffbdbd",
  200: "#ff9b9b",
  300: "#f86a6a",
  400: "#ef4e4e",
  500: "#e12d39",
  600: "#cf1124",
  700: "#ab091e",
  800: "#8a041a",
  900: "#610316",
});

const whiteAlpha: PaletteScale = {
  50: "rgba(255, 255, 255, 0.04)",
  100: "rgba(255, 255, 255, 0.06)",
  200: "rgba(255, 255, 255, 0.08)",
  300: "rgba(255, 255, 255, 0.16)",
  400: "rgba(255, 255, 255, 0.24)",
  500: "rgba(255, 255, 255, 0.36)",
  600: "rgba(255, 255, 255, 0.48)",
  700: "rgba(255, 255, 255, 0.64)",
  800: "rgba(255, 255, 255, 0.80)",
  900: "rgba(255, 255, 255, 0.92)",
};

const blackAlpha: PaletteScale = {
  50: "rgba(0, 0, 0, 0.04)",
  100: "rgba(0, 0, 0, 0.06)",
  200: "rgba(0, 0, 0, 0.08)",
  300: "rgba(0, 0, 0, 0.16)",
  400: "rgba(0, 0, 0, 0.24)",
  500: "rgba(0, 0, 0, 0.36)",
  600: "rgba(0, 0, 0, 0.48)",
  700: "rgba(0, 0, 0, 0.64)",
  800: "rgba(0, 0, 0, 0.80)",
  900: "rgba(0, 0, 0, 0.92)",
};

const white = "#ffffff";
const black = "#0a0a0a"; // very dark neutral gray, do not use pure black.

export function createDefaultColors(cssVarPrefix: string): ThemeColors {
  const getCssVar = createGetCssVar(cssVarPrefix);

  return {
    light: {
      whiteAlpha,
      blackAlpha,
      primary,
      neutral,
      success,
      info,
      warning,
      danger,
      common: {
        white,
        black,
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
        surface: getCssVar("colors-common-white"),
        level1: getCssVar("colors-neutral-50"),
        level2: getCssVar("colors-neutral-100"),
        level3: getCssVar("colors-neutral-200"),
      },
    },
    dark: {
      whiteAlpha,
      blackAlpha,
      primary,
      neutral,
      success,
      info,
      warning,
      danger,
      common: {
        white,
        black,
        divider: getCssVar("colors-neutral-800"),
        focusRing: getCssVar("colors-primary-600"),
      },
      text: {
        primary: getCssVar("colors-neutral-100"),
        secondary: getCssVar("colors-neutral-300"),
        tertiary: getCssVar("colors-neutral-400"),
      },
      background: {
        body: getCssVar("colors-common-black"),
        surface: getCssVar("colors-neutral-900"),
        level1: getCssVar("colors-neutral-800"),
        level2: getCssVar("colors-neutral-700"),
        level3: getCssVar("colors-neutral-600"),
      },
    },
  };
}
