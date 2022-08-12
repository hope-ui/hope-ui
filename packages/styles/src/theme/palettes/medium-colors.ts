/*!
 * Original code by MUI
 * MIT Licensed, Copyright (c) 2014 Call-Em-All.
 *
 * Credits to the MUI team:
 * https://github.com/mui/material-ui/blob/master/packages/mui-joy/src/styles/extendTheme.ts
 *
 * Colors from TailwindCSS
 * MIT Licensed, Copyright (c) Tailwind Labs, Inc.
 *
 * Credits to the Tailwind Labs team:
 * https://github.com/tailwindlabs/tailwindcss/blob/master/src/public/colors.js
 */

import { PaletteRangeGenerator, PaletteScale } from "../../types";
import { createGetCssVar } from "../../utils/css-var";
import { generatePaletteChannel, PaletteGeneratorTuple } from "./utils";

/** Utility function to create palette for medium colors. */
function mediumPalette(scale: PaletteScale): PaletteGeneratorTuple {
  const common = {
    ...scale,
    ...generatePaletteChannel(scale),
  };

  const light: PaletteRangeGenerator = (color, cssVarPrefix) => {
    const getCssVar = createGetCssVar(cssVarPrefix);

    return {
      ...common,

      // global variant - solid
      solidText: "#ffffff",
      solidBg: getCssVar(`colors-${color}-600`),
      solidBorder: getCssVar(`colors-${color}-600`),

      solidHoverText: "#ffffff",
      solidHoverBg: getCssVar(`colors-${color}-700`),
      solidHoverBorder: getCssVar(`colors-${color}-700`),

      solidActiveText: "#ffffff",
      solidActiveBg: getCssVar(`colors-${color}-800`),
      solidActiveBorder: getCssVar(`colors-${color}-800`),

      solidDisabledText: "#ffffff",
      solidDisabledBg: getCssVar(`colors-${color}-200`),
      solidDisabledBorder: getCssVar(`colors-${color}-200`),

      // global variant - soft
      softText: getCssVar(`colors-${color}-800`),
      softBg: getCssVar(`colors-${color}-100`),
      softBorder: getCssVar(`colors-${color}-100`),

      softHoverText: getCssVar(`colors-${color}-800`),
      softHoverBg: getCssVar(`colors-${color}-200`),
      softHoverBorder: getCssVar(`colors-${color}-200`),

      softActiveText: getCssVar(`colors-${color}-900`),
      softActiveBg: getCssVar(`colors-${color}-300`),
      softActiveBorder: getCssVar(`colors-${color}-300`),

      softDisabledText: getCssVar(`colors-${color}-300`),
      softDisabledBg: getCssVar(`colors-${color}-50`),
      softDisabledBorder: getCssVar(`colors-${color}-50`),

      // global variant - outlined
      outlinedText: getCssVar(`colors-${color}-700`),
      outlinedBg: "transparent",
      outlinedBorder: getCssVar(`colors-${color}-300`),

      outlinedHoverText: getCssVar(`colors-${color}-700`),
      outlinedHoverBg: getCssVar(`colors-${color}-50`),
      outlinedHoverBorder: getCssVar(`colors-${color}-400`),

      outlinedActiveText: getCssVar(`colors-${color}-700`),
      outlinedActiveBg: getCssVar(`colors-${color}-100`),
      outlinedActiveBorder: getCssVar(`colors-${color}-400`),

      outlinedDisabledText: getCssVar(`colors-${color}-200`),
      outlinedDisabledBg: "transparent",
      outlinedDisabledBorder: getCssVar(`colors-${color}-100`),

      // global variant - plain
      plainText: getCssVar(`colors-${color}-700`),
      plainBg: "transparent",
      plainBorder: "transparent",

      plainHoverText: getCssVar(`colors-${color}-700`),
      plainHoverBg: getCssVar(`colors-${color}-50`),
      plainHoverBorder: getCssVar(`colors-${color}-50`),

      plainActiveText: getCssVar(`colors-${color}-700`),
      plainActiveBg: getCssVar(`colors-${color}-100`),
      plainActiveBorder: getCssVar(`colors-${color}-100`),

      plainDisabledText: getCssVar(`colors-${color}-200`),
      plainDisabledBg: "transparent",
      plainDisabledBorder: "transparent",

      // global variant - override text
      overrideTextPrimary: getCssVar(`colors-${color}-900`),
      overrideTextSecondary: getCssVar(`colors-${color}-800`),
      overrideTextTertiary: getCssVar(`colors-${color}-700`),
    };
  };

  const dark: PaletteRangeGenerator = (color, cssVarPrefix) => {
    const getCssVar = createGetCssVar(cssVarPrefix);

    return {
      ...common,

      // global variant - solid
      solidText: "#ffffff",
      solidBg: getCssVar(`colors-${color}-700`),
      solidBorder: getCssVar(`colors-${color}-700`),

      solidHoverText: "#ffffff",
      solidHoverBg: getCssVar(`colors-${color}-800`),
      solidHoverBorder: getCssVar(`colors-${color}-800`),

      solidActiveText: "#ffffff",
      solidActiveBg: getCssVar(`colors-${color}-900`),
      solidActiveBorder: getCssVar(`colors-${color}-900`),

      solidDisabledText: getCssVar(`colors-${color}-900`),
      solidDisabledBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.5)`,
      solidDisabledBorder: "transparent",

      // global variant - soft
      softText: getCssVar(`colors-${color}-300`),
      softBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.6)`,
      softBorder: "transparent",

      softHoverText: getCssVar(`colors-${color}-300`),
      softHoverBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.7)`,
      softHoverBorder: "transparent",

      softActiveText: getCssVar(`colors-${color}-300`),
      softActiveBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.8)`,
      softActiveBorder: "transparent",

      softDisabledText: getCssVar(`colors-${color}-900`),
      softDisabledBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.3)`,
      softDisabledBorder: "transparent",

      // global variant - outlined
      outlinedText: getCssVar(`colors-${color}-200`),
      outlinedBg: "transparent",
      outlinedBorder: getCssVar(`colors-${color}-800`),

      outlinedHoverText: getCssVar(`colors-${color}-200`),
      outlinedHoverBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.1)`,
      outlinedHoverBorder: getCssVar(`colors-${color}-700`),

      outlinedActiveText: getCssVar(`colors-${color}-200`),
      outlinedActiveBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.2)`,
      outlinedActiveBorder: getCssVar(`colors-${color}-700`),

      outlinedDisabledText: getCssVar(`colors-${color}-900`),
      outlinedDisabledBg: "transparent",
      outlinedDisabledBorder: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.6)`,

      // global variant - plain
      plainText: getCssVar(`colors-${color}-200`),
      plainBg: "transparent",
      plainBorder: "transparent",

      plainHoverText: getCssVar(`colors-${color}-200`),
      plainHoverBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.1)`,
      plainHoverBorder: "transparent",

      plainActiveText: getCssVar(`colors-${color}-200`),
      plainActiveBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.2)`,
      plainActiveBorder: "transparent",

      plainDisabledText: getCssVar(`colors-${color}-900`),
      plainDisabledBg: "transparent",
      plainDisabledBorder: "transparent",

      // global variant - override text
      overrideTextPrimary: getCssVar(`colors-${color}-200`),
      overrideTextSecondary: getCssVar(`colors-${color}-400`),
      overrideTextTertiary: getCssVar(`colors-${color}-500`),
    };
  };

  return [light, dark];
}

export const [blue, blueDark] = mediumPalette({
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

export const [indigo, indigoDark] = mediumPalette({
  50: "#eef2ff",
  100: "#e0e7ff",
  200: "#c7d2fe",
  300: "#a5b4fc",
  400: "#818cf8",
  500: "#6366f1",
  600: "#4f46e5",
  700: "#4338ca",
  800: "#3730a3",
  900: "#312e81",
});

export const [violet, violetDark] = mediumPalette({
  50: "#f5f3ff",
  100: "#ede9fe",
  200: "#ddd6fe",
  300: "#c4b5fd",
  400: "#a78bfa",
  500: "#8b5cf6",
  600: "#7c3aed",
  700: "#6d28d9",
  800: "#5b21b6",
  900: "#4c1d95",
});

export const [purple, purpleDark] = mediumPalette({
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

export const [fuchsia, fuchsiaDark] = mediumPalette({
  50: "#fdf4ff",
  100: "#fae8ff",
  200: "#f5d0fe",
  300: "#f0abfc",
  400: "#e879f9",
  500: "#d946ef",
  600: "#c026d3",
  700: "#a21caf",
  800: "#86198f",
  900: "#701a75",
});

export const [pink, pinkDark] = mediumPalette({
  50: "#fdf2f8",
  100: "#fce7f3",
  200: "#fbcfe8",
  300: "#f9a8d4",
  400: "#f472b6",
  500: "#ec4899",
  600: "#db2777",
  700: "#be185d",
  800: "#9d174d",
  900: "#831843",
});

export const [rose, roseDark] = mediumPalette({
  50: "#fff1f2",
  100: "#ffe4e6",
  200: "#fecdd3",
  300: "#fda4af",
  400: "#fb7185",
  500: "#f43f5e",
  600: "#e11d48",
  700: "#be123c",
  800: "#9f1239",
  900: "#881337",
});

export const [red, redDark] = mediumPalette({
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
