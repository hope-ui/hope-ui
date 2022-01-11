import merge from "lodash.merge";

import type { Theme } from "./types";

export const defaultTheme: Theme = {};

export function extendTheme(themeOverride: Theme): Theme {
  return merge(defaultTheme, themeOverride);
}
