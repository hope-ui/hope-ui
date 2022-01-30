import merge from "lodash.merge";

import { defaultTheme } from "./defaultTheme";
import { createTheme } from "./stitches.config";
import { HopeTheme, HopeThemeOverride } from "./types";

export function extendTheme(themeOverride: HopeThemeOverride): HopeTheme {
  // create a copy to not mutate the original theme
  const customTheme = merge({}, defaultTheme);

  if (themeOverride.initialColorMode) {
    customTheme.initialColorMode = themeOverride.initialColorMode;
  }

  // Create a stitches theme
  if (themeOverride.tokens) {
    merge(customTheme.tokens, createTheme(themeOverride.tokens));
  }

  if (themeOverride.components) {
    merge(customTheme.components, themeOverride.components);
  }

  return customTheme;
}
