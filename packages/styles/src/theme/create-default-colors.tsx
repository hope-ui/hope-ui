import { ThemeColors } from "../types";
import { createGetCssVar } from "../utils/css-var";
import {
  blue,
  blueDark,
  gray,
  grayDark,
  green,
  greenDark,
  purple,
  purpleDark,
  red,
  redDark,
  yellow,
  yellowDark,
} from "./palettes";

export function createDefaultColors(cssVarPrefix: string): ThemeColors {
  const getCssVar = createGetCssVar(cssVarPrefix);

  return {
    light: {
      primary: blue("primary", cssVarPrefix),
      neutral: gray("neutral", cssVarPrefix),
      success: green("success", cssVarPrefix),
      info: purple("info", cssVarPrefix),
      warning: yellow("warning", cssVarPrefix),
      danger: red("danger", cssVarPrefix),
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
      primary: blueDark("primary", cssVarPrefix),
      neutral: grayDark("neutral", cssVarPrefix),
      success: greenDark("success", cssVarPrefix),
      info: purpleDark("info", cssVarPrefix),
      warning: yellowDark("warning", cssVarPrefix),
      danger: redDark("danger", cssVarPrefix),
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
