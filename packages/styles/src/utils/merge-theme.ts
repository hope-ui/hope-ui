import mergeWith from "lodash.mergewith";

import { Theme, ThemeOverride } from "../types";
import { attachMetaData } from "./attach-meta-data";

export function mergeTheme(currentTheme: Theme, themeOverride?: ThemeOverride): Theme {
  if (!themeOverride) {
    return currentTheme;
  }

  const mergedTheme = mergeWith({}, currentTheme, themeOverride);

  return attachMetaData(mergedTheme);
}
