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

/** Utility function to create palette for bright colors. */
function brightPalette(scale: PaletteScale): PaletteGeneratorTuple {
  const common = {
    ...scale,
    ...generatePaletteChannel(scale),
  };

  const light: PaletteRangeGenerator = (color, cssVarPrefix) => {
    const getCssVar = createGetCssVar(cssVarPrefix);

    return {
      ...common,

      // global variant - solid
      solidText: getCssVar(`colors-${color}-900`),
      solidBg: getCssVar(`colors-${color}-300`),
      solidBorder: getCssVar(`colors-${color}-300`),

      solidHoverText: getCssVar(`colors-${color}-900`),
      solidHoverBg: getCssVar(`colors-${color}-400`),
      solidHoverBorder: getCssVar(`colors-${color}-400`),

      solidActiveText: getCssVar(`colors-${color}-900`),
      solidActiveBg: getCssVar(`colors-${color}-500`),
      solidActiveBorder: getCssVar(`colors-${color}-500`),

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
      outlinedActiveBg: `rgb(${getCssVar(`colors-${color}-lightChannel`)} / 0.6)`,
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
      plainActiveBg: `rgb(${getCssVar(`colors-${color}-lightChannel`)} / 0.6)`,
      plainActiveBorder: "transparent",

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

export const [orange, orangeDark] = brightPalette({
  50: "#fff7ed",
  100: "#ffedd5",
  200: "#fed7aa",
  300: "#fdba74",
  400: "#fb923c",
  500: "#f97316",
  600: "#ea580c",
  700: "#c2410c",
  800: "#9a3412",
  900: "#7c2d12",
});

export const [emerald, emeraldDark] = brightPalette({
  50: "#ecfdf5",
  100: "#d1fae5",
  200: "#a7f3d0",
  300: "#6ee7b7",
  400: "#34d399",
  500: "#10b981",
  600: "#059669",
  700: "#047857",
  800: "#065f46",
  900: "#064e3b",
});

export const [teal, tealDark] = brightPalette({
  50: "#f0fdfa",
  100: "#ccfbf1",
  200: "#99f6e4",
  300: "#5eead4",
  400: "#2dd4bf",
  500: "#14b8a6",
  600: "#0d9488",
  700: "#0f766e",
  800: "#115e59",
  900: "#134e4a",
});

export const [cyan, cyanDark] = brightPalette({
  50: "#ecfeff",
  100: "#cffafe",
  200: "#a5f3fc",
  300: "#67e8f9",
  400: "#22d3ee",
  500: "#06b6d4",
  600: "#0891b2",
  700: "#0e7490",
  800: "#155e75",
  900: "#164e63",
});

export const [sky, skyDark] = brightPalette({
  50: "#f0f9ff",
  100: "#e0f2fe",
  200: "#bae6fd",
  300: "#7dd3fc",
  400: "#38bdf8",
  500: "#0ea5e9",
  600: "#0284c7",
  700: "#0369a1",
  800: "#075985",
  900: "#0c4a6e",
});
