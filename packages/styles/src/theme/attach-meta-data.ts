import { pick } from "@hope-ui/utils";

import { MaybeThemeWithMetaData, Theme, ThemeScales } from "../types";
import { analyzeBreakpoints } from "../utils/breakpoint";
import { createThemeVars } from "./create-theme-vars";

const THEME_SCALE_NAMES: Array<keyof ThemeScales> = [
  "colors",
  "fonts",
  "fontSizes",
  "fontWeights",
  "lineHeights",
  "letterSpacings",
  "space",
  "sizes",
  "radii",
  "shadows",
  "zIndices",
  "breakpoints",
];

function extractScales(theme: MaybeThemeWithMetaData): ThemeScales {
  return pick(theme, THEME_SCALE_NAMES);
}

function omitMetaData(rawTheme: MaybeThemeWithMetaData) {
  const { vars, __cssVarsValues, __breakpoints, ...cleanTheme } = rawTheme;
  return cleanTheme;
}

export function attachMetaData(rawTheme: MaybeThemeWithMetaData) {
  /**
   * In the case the theme has already been converted to css-var (e.g. extending the theme),
   * we can omit the computed css vars and recompute it for the extended theme.
   */
  const theme = omitMetaData(rawTheme);

  const scales = extractScales(theme);

  const { cssVarsValues, vars } = createThemeVars(scales, theme.cssVarPrefix);

  Object.assign(theme, {
    vars,
    __cssVarsValues: cssVarsValues,
    __breakpoints: analyzeBreakpoints(theme.breakpoints),
  });

  return theme as Theme;
}
