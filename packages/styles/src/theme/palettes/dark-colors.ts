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

/** Utility function to create palette for dark colors. */
function darkPalette(scale: PaletteScale): PaletteGeneratorTuple {
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
      solidBg: getCssVar(`colors-${color}-900`),
      solidBorder: getCssVar(`colors-${color}-900`),

      solidHoverText: "#ffffff",
      solidHoverBg: getCssVar(`colors-${color}-800`),
      solidHoverBorder: getCssVar(`colors-${color}-800`),

      solidActiveText: "#ffffff",
      solidActiveBg: getCssVar(`colors-${color}-700`),
      solidActiveBorder: getCssVar(`colors-${color}-700`),

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

      softActiveText: getCssVar(`colors-${color}-800`),
      softActiveBg: getCssVar(`colors-${color}-300`),
      softActiveBorder: getCssVar(`colors-${color}-300`),

      softDisabledText: getCssVar(`colors-${color}-300`),
      softDisabledBg: getCssVar(`colors-${color}-50`),
      softDisabledBorder: getCssVar(`colors-${color}-50`),

      // global variant - outlined
      outlinedText: getCssVar(`colors-${color}-800`),
      outlinedBg: "transparent",
      outlinedBorder: getCssVar(`colors-${color}-300`),

      outlinedHoverText: getCssVar(`colors-${color}-800`),
      outlinedHoverBg: getCssVar(`colors-${color}-50`),
      outlinedHoverBorder: getCssVar(`colors-${color}-400`),

      outlinedActiveText: getCssVar(`colors-${color}-800`),
      outlinedActiveBg: getCssVar(`colors-${color}-100`),
      outlinedActiveBorder: getCssVar(`colors-${color}-400`),

      outlinedDisabledText: getCssVar(`colors-${color}-200`),
      outlinedDisabledBg: "transparent",
      outlinedDisabledBorder: getCssVar(`colors-${color}-100`),

      // global variant - plain
      plainText: getCssVar(`colors-${color}-800`),
      plainBg: "transparent",
      plainBorder: "transparent",

      plainHoverText: getCssVar(`colors-${color}-800`),
      plainHoverBg: getCssVar(`colors-${color}-50`),
      plainHoverBorder: getCssVar(`colors-${color}-50`),

      plainActiveText: getCssVar(`colors-${color}-800`),
      plainActiveBg: getCssVar(`colors-${color}-100`),
      plainActiveBorder: getCssVar(`colors-${color}-100`),

      plainDisabledText: getCssVar(`colors-${color}-200`),
      plainDisabledBg: "transparent",
      plainDisabledBorder: "transparent",

      // global variant - override text
      overrideTextPrimary: getCssVar(`colors-${color}-800`),
      overrideTextSecondary: getCssVar(`colors-${color}-600`),
      overrideTextTertiary: getCssVar(`colors-${color}-500`),
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
      solidHoverBg: getCssVar(`colors-${color}-600`),
      solidHoverBorder: getCssVar(`colors-${color}-600`),

      solidActiveText: "#ffffff",
      solidActiveBg: getCssVar(`colors-${color}-500`),
      solidActiveBorder: getCssVar(`colors-${color}-500`),

      solidDisabledText: getCssVar(`colors-${color}-600`),
      solidDisabledBg: getCssVar(`colors-${color}-700`),
      solidDisabledBorder: getCssVar(`colors-${color}-700`),

      // global variant - soft
      softText: getCssVar(`colors-${color}-100`),
      softBg: `rgb(${getCssVar(`colors-${color}-mainChannel`)} / 0.15)`,
      softBorder: "transparent",

      softHoverText: getCssVar(`colors-${color}-100`),
      softHoverBg: `rgb(${getCssVar(`colors-${color}-mainChannel`)} / 0.25)`,
      softHoverBorder: "transparent",

      softActiveText: getCssVar(`colors-${color}-100`),
      softActiveBg: `rgb(${getCssVar(`colors-${color}-mainChannel`)} / 0.35)`,
      softActiveBorder: "transparent",

      softDisabledText: getCssVar(`colors-${color}-700`),
      softDisabledBg: getCssVar(`colors-${color}-800`),
      softDisabledBorder: getCssVar(`colors-${color}-800`),

      // global variant - outlined
      outlinedText: getCssVar(`colors-${color}-100`),
      outlinedBg: "transparent",
      outlinedBorder: getCssVar(`colors-${color}-800`),

      outlinedHoverText: getCssVar(`colors-${color}-100`),
      outlinedHoverBg: `rgb(${getCssVar(`colors-${color}-mainChannel`)} / 0.05)`,
      outlinedHoverBorder: getCssVar(`colors-${color}-700`),

      outlinedActiveText: getCssVar(`colors-${color}-100`),
      outlinedActiveBg: `rgb(${getCssVar(`colors-${color}-mainChannel`)} / 0.1)`,
      outlinedActiveBorder: getCssVar(`colors-${color}-700`),

      outlinedDisabledText: getCssVar(`colors-${color}-800`),
      outlinedDisabledBg: "transparent",
      outlinedDisabledBorder: getCssVar(`colors-${color}-800`),

      // global variant - plain
      plainText: getCssVar(`colors-${color}-100`),
      plainBg: "transparent",
      plainBorder: "transparent",

      plainHoverText: getCssVar(`colors-${color}-100`),
      plainHoverBg: `rgb(${getCssVar(`colors-${color}-mainChannel`)} / 0.05)`,
      plainHoverBorder: "transparent",

      plainActiveText: getCssVar(`colors-${color}-100`),
      plainActiveBg: `rgb(${getCssVar(`colors-${color}-mainChannel`)} / 0.1)`,
      plainActiveBorder: "transparent",

      plainDisabledText: getCssVar(`colors-${color}-800`),
      plainDisabledBg: "transparent",
      plainDisabledBorder: "transparent",

      // global variant - override text
      overrideTextPrimary: getCssVar(`colors-${color}-100`),
      overrideTextSecondary: getCssVar(`colors-${color}-300`),
      overrideTextTertiary: getCssVar(`colors-${color}-400`),
    };
  };

  return [light, dark];
}

export const [slate, slateDark] = darkPalette({
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#334155",
  800: "#1e293b",
  900: "#0f172a",
});

export const [gray, grayDark] = darkPalette({
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

export const [zinc, zincDark] = darkPalette({
  50: "#fafafa",
  100: "#f4f4f5",
  200: "#e4e4e7",
  300: "#d4d4d8",
  400: "#a1a1aa",
  500: "#71717a",
  600: "#52525b",
  700: "#3f3f46",
  800: "#27272a",
  900: "#18181b",
});

export const [neutral, neutralDark] = darkPalette({
  50: "#fafafa",
  100: "#f5f5f5",
  200: "#e5e5e5",
  300: "#d4d4d4",
  400: "#a3a3a3",
  500: "#737373",
  600: "#525252",
  700: "#404040",
  800: "#262626",
  900: "#171717",
});

export const [stone, stoneDark] = darkPalette({
  50: "#fafaf9",
  100: "#f5f5f4",
  200: "#e7e5e4",
  300: "#d6d3d1",
  400: "#a8a29e",
  500: "#78716c",
  600: "#57534e",
  700: "#44403c",
  800: "#292524",
  900: "#1c1917",
});
