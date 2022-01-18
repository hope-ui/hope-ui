import merge from "lodash.merge";

import { stitches } from "@/stitches/stitches.config";
import { HopeTheme, HopeThemeOverride } from "@/types/theme";

import { defaultTheme } from "./defaultTheme";

export function extendTheme(themeOverride: HopeThemeOverride): HopeTheme {
  // create a copy to not mutate the original theme
  const customTheme = merge({}, defaultTheme);

  merge(customTheme, stitches.createTheme(themeOverride));

  return customTheme;
}
