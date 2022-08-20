import { mergeWith } from "lodash-es";

import { Theme, ThemeOverride } from "../types";
import { attachMetaData } from "./attach-meta-data";
import { createDefaultColors } from "./create-default-colors";
import { DEFAULT_THEME } from "./default-theme";

function mergeTheme(currentTheme: Theme, themeOverride?: ThemeOverride): Theme {
  if (!themeOverride) {
    return currentTheme;
  }

  const mergedTheme = mergeWith({}, currentTheme, themeOverride);

  return attachMetaData(mergedTheme);
}

export function extendTheme(themeOverride: ThemeOverride): Theme {
  let finalDefaultTheme = DEFAULT_THEME;

  // Need to recreate colors if user has set a custom css var prefix,
  // so global variants css variables reference is correct.
  if (themeOverride.cssVarPrefix != null) {
    finalDefaultTheme = {
      ...DEFAULT_THEME,
      colors: createDefaultColors(themeOverride.cssVarPrefix),
    };
  }

  return mergeTheme(finalDefaultTheme, themeOverride);
}
