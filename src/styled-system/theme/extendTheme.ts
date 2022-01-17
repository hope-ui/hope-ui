import merge from "lodash.merge";

import { stitches } from "@/styled-system/stitches.config";

import { HopeTheme, HopeThemeOverride } from "../types/theme";
import { defaultTheme } from "./defaultTheme";

export function extendTheme(themeOverride: HopeThemeOverride): HopeTheme {
  // create a copy to not mutate the original theme
  const customTheme = merge({}, defaultTheme);

  if (themeOverride.tokens) {
    merge(customTheme.tokens, stitches.createTheme(themeOverride.tokens));
  }

  // merge(customTheme.components, themeOverride.components);

  return customTheme;
}
