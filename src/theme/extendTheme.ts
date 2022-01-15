import merge from "lodash.merge";

import { createTheme } from "@/stitches/stitches.config";

import { HopeTheme, HopeThemeOverride } from ".";
import { defaultHopeTheme } from "./defaultHopeTheme";

export function extendTheme(themeOverride: HopeThemeOverride): HopeTheme {
  // create a copy to not mutate the original theme
  const customTheme = merge({}, defaultHopeTheme);

  if (themeOverride.tokens) {
    merge(customTheme.stitchesTheme, createTheme(themeOverride.tokens));
  }

  merge(customTheme.components, themeOverride.components);

  return customTheme;
}
