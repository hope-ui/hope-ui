import merge from "lodash.merge";

import { createDefaultTheme, createTheme } from "./stitches.config";
import { HopeTheme, HopeThemeOverride } from "./types";

export function extendTheme(themeOverride: HopeThemeOverride): HopeTheme {
  // create a copy to not mutate the original theme
  const customTheme = merge({}, createDefaultTheme());

  if (themeOverride.initialColorMode) {
    customTheme.initialColorMode = themeOverride.initialColorMode;
  }

  // Create a stitches light theme
  if (themeOverride.light) {
    merge(customTheme.light, createTheme("hope-ui-light", themeOverride.light));
  }

  // Create a stitches dark theme
  if (themeOverride.dark) {
    merge(customTheme.dark, createTheme("hope-ui-dark", themeOverride.dark));
  }

  if (themeOverride.components) {
    merge(customTheme.components, themeOverride.components);
  }

  return customTheme;
}
