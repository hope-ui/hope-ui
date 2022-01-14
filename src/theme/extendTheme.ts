import merge from "lodash.merge";

import { DeepPartial, defaultTheme, HopeTheme } from "@/theme";

export function extendTheme(themeOverride: DeepPartial<HopeTheme>): HopeTheme {
  const defaultThemeCopy = merge({}, defaultTheme);
  return merge(defaultThemeCopy, themeOverride);
}
