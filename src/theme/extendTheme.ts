import merge from "lodash.merge";

import { createTheme } from "../styled-system/stitches.config";
import { defaultTheme } from "./defaultTheme";
import { HopeTheme, HopeThemeOverride } from "./types";

export function extendTheme(themeOverride: HopeThemeOverride): HopeTheme {
  // create a copy to not mutate the original theme
  const customTheme = merge({}, defaultTheme);

  if (themeOverride.tokens) {
    merge(customTheme.tokens, createTheme(themeOverride.tokens));
  }

  return customTheme;
}
