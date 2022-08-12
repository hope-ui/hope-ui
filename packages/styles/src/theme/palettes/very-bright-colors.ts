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

/** Utility function to create palette for very bright colors. */
function veryBrightPalette(scale: PaletteScale): PaletteGeneratorTuple {
  const common = {
    ...scale,
    ...generatePaletteChannel(scale),
  };

  const light: PaletteRangeGenerator = (color, cssVarPrefix) => {
    const getCssVar = createGetCssVar(cssVarPrefix);

    return {
      ...common,

      // global variant - solid
      solidText: getCssVar(`colors-${color}-800`),
      solidBg: getCssVar(`colors-${color}-200`),
      solidBorder: getCssVar(`colors-${color}-200`),

      solidHoverText: getCssVar(`colors-${color}-800`),
      solidHoverBg: getCssVar(`colors-${color}-300`),
      solidHoverBorder: getCssVar(`colors-${color}-300`),

      solidActiveText: getCssVar(`colors-${color}-900`),
      solidActiveBg: getCssVar(`colors-${color}-400`),
      solidActiveBorder: getCssVar(`colors-${color}-400`),

      solidDisabledText: getCssVar(`colors-${color}-200`),
      solidDisabledBg: getCssVar(`colors-${color}-50`),
      solidDisabledBorder: getCssVar(`colors-${color}-50`),

      // global variant - soft
      softText: getCssVar(`colors-${color}-800`),
      softBg: getCssVar(`colors-${color}-50`),
      softBorder: getCssVar(`colors-${color}-50`),

      softHoverText: getCssVar(`colors-${color}-800`),
      softHoverBg: getCssVar(`colors-${color}-100`),
      softHoverBorder: getCssVar(`colors-${color}-100`),

      softActiveText: getCssVar(`colors-${color}-800`),
      softActiveBg: getCssVar(`colors-${color}-200`),
      softActiveBorder: getCssVar(`colors-${color}-200`),

      softDisabledText: getCssVar(`colors-${color}-200`),
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

      outlinedDisabledText: getCssVar(`colors-${color}-100`),
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

      plainDisabledText: getCssVar(`colors-${color}-100`),
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
      solidText: getCssVar(`colors-${color}-900`),
      solidBg: getCssVar(`colors-${color}-300`),
      solidBorder: getCssVar(`colors-${color}-300`),

      solidHoverText: getCssVar(`colors-${color}-900`),
      solidHoverBg: getCssVar(`colors-${color}-400`),
      solidHoverBorder: getCssVar(`colors-${color}-400`),

      solidActiveText: getCssVar(`colors-${color}-900`),
      solidActiveBg: getCssVar(`colors-${color}-500`),
      solidActiveBorder: getCssVar(`colors-${color}-500`),

      solidDisabledText: getCssVar(`colors-${color}-800`),
      solidDisabledBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.6)`,
      solidDisabledBorder: "transparent",

      // global variant - soft
      softText: getCssVar(`colors-${color}-200`),
      softBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.4)`,
      softBorder: "transparent",

      softHoverText: getCssVar(`colors-${color}-200`),
      softHoverBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.5)`,
      softHoverBorder: "transparent",

      softActiveText: getCssVar(`colors-${color}-200`),
      softActiveBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.6)`,
      softActiveBorder: "transparent",

      softDisabledText: getCssVar(`colors-${color}-800`),
      softDisabledBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.6)`,
      softDisabledBorder: "transparent",

      // global variant - outlined
      outlinedText: getCssVar(`colors-${color}-200`),
      outlinedBg: "transparent",
      outlinedBorder: getCssVar(`colors-${color}-700`),

      outlinedHoverText: getCssVar(`colors-${color}-200`),
      outlinedHoverBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.1)`,
      outlinedHoverBorder: getCssVar(`colors-${color}-600`),

      outlinedActiveText: getCssVar(`colors-${color}-200`),
      outlinedActiveBg: `rgb(${getCssVar(`colors-${color}-darkChannel`)} / 0.2)`,
      outlinedActiveBorder: getCssVar(`colors-${color}-600`),

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

export const [amber, amberDark] = veryBrightPalette({
  50: "#fffbeb",
  100: "#fef3c7",
  200: "#fde68a",
  300: "#fcd34d",
  400: "#fbbf24",
  500: "#f59e0b",
  600: "#d97706",
  700: "#b45309",
  800: "#92400e",
  900: "#78350f",
});

export const [yellow, yellowDark] = veryBrightPalette({
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

export const [lime, limeDark] = veryBrightPalette({
  50: "#f7fee7",
  100: "#ecfccb",
  200: "#d9f99d",
  300: "#bef264",
  400: "#a3e635",
  500: "#84cc16",
  600: "#65a30d",
  700: "#4d7c0f",
  800: "#3f6212",
  900: "#365314",
});

export const [green, greenDark] = veryBrightPalette({
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
