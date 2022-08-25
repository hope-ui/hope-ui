import { dset } from "dset/merge";

import { Theme, ThemeOverride } from "../types";
import { attachMetaData } from "./attach-meta-data";
import { createDefaultColors } from "./create-default-colors";
import { DEFAULT_THEME } from "./default-theme";

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

  const mergedTheme = {
    value: finalDefaultTheme,
  };

  dset(mergedTheme, "value", themeOverride);

  return attachMetaData(mergedTheme.value);
}
