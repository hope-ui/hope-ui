import { ThemeColors } from "../types";
import { createGetCssVar } from "../utils/css-var";
import { amber } from "./palettes";

export function createDefaultColors(cssVarPrefix: string): ThemeColors {
  const getCssVar = createGetCssVar(cssVarPrefix);

  return {
    light: {
      primary: amber("primary", cssVarPrefix),
      neutral: amber("neutral", cssVarPrefix),
      success: amber("success", cssVarPrefix),
      info: amber("info", cssVarPrefix),
      warning: amber("warning", cssVarPrefix),
      danger: amber("danger", cssVarPrefix),
      common: {
        white: "#ffffff",
        black: "#000000",
        divider: getCssVar("colors-neutral-200"),
        focusRing: getCssVar("colors-primary-500"),
      },
      background: {
        body: getCssVar("colors-common-white"),
        surface0: getCssVar("colors-common-white"),
        surface1: getCssVar("colors-neutral-50"),
        surface2: getCssVar("colors-neutral-100"),
        surface3: getCssVar("colors-neutral-200"),
        tooltip: getCssVar("colors-neutral-800"),
      },
      text: {
        primary: getCssVar("colors-neutral-800"),
        secondary: getCssVar("colors-neutral-600"),
        tertiary: getCssVar("colors-neutral-500"),
      },
    },
    dark: {
      primary: amber("primary", cssVarPrefix),
      neutral: amber("neutral", cssVarPrefix),
      success: amber("success", cssVarPrefix),
      info: amber("info", cssVarPrefix),
      warning: amber("warning", cssVarPrefix),
      danger: amber("danger", cssVarPrefix),
      common: {
        white: "#ffffff",
        black: "#000000",
        divider: getCssVar("colors-neutral-200"),
        focusRing: getCssVar("colors-primary-500"),
      },
      background: {
        body: getCssVar("colors-common-white"),
        surface0: getCssVar("colors-common-white"),
        surface1: getCssVar("colors-neutral-50"),
        surface2: getCssVar("colors-neutral-100"),
        surface3: getCssVar("colors-neutral-200"),
        tooltip: getCssVar("colors-neutral-800"),
      },
      text: {
        primary: getCssVar("colors-neutral-800"),
        secondary: getCssVar("colors-neutral-600"),
        tertiary: getCssVar("colors-neutral-500"),
      },
    },
  };
}
