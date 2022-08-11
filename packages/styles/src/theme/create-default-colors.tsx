import { ThemeColors } from "../types";
import { createGetCssVar } from "../utils/css-var";
import { amberPalette } from "./palettes";

export function createDefaultColors(cssVarPrefix: string): ThemeColors {
  const getCssVar = createGetCssVar(cssVarPrefix);

  return {
    light: {
      primary: amberPalette("primary", cssVarPrefix),
      neutral: amberPalette("neutral", cssVarPrefix),
      success: amberPalette("success", cssVarPrefix),
      info: amberPalette("info", cssVarPrefix),
      warning: amberPalette("warning", cssVarPrefix),
      danger: amberPalette("danger", cssVarPrefix),
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
      primary: amberPalette("primary", cssVarPrefix),
      neutral: amberPalette("neutral", cssVarPrefix),
      success: amberPalette("success", cssVarPrefix),
      info: amberPalette("info", cssVarPrefix),
      warning: amberPalette("warning", cssVarPrefix),
      danger: amberPalette("danger", cssVarPrefix),
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
  };
}
