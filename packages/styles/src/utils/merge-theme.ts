import { attachMetadata } from "../theme/attach-metadata";
import { Theme, ThemeBase, ThemeOverride } from "../types";

export function mergeTheme(currentTheme: ThemeBase, themeOverride?: ThemeOverride): ThemeBase {
  if (!themeOverride) {
    return currentTheme;
  }

  return Object.keys(currentTheme).reduce((acc, key) => {
    const currentValue = currentTheme[key as keyof ThemeBase];
    const overrideValue = themeOverride[key as keyof ThemeOverride];

    let mergedValue;

    if (typeof overrideValue === "object" && typeof currentValue === "object") {
      mergedValue = { ...currentValue, ...overrideValue };
    } else {
      mergedValue = overrideValue ?? currentValue;
    }

    return {
      ...acc,
      [key]: mergedValue,
    };
  }, {} as ThemeBase);
}

export function mergeThemeWithMetadata(
  currentTheme: ThemeBase,
  themeOverride?: ThemeOverride
): Theme {
  return attachMetadata(mergeTheme(currentTheme, themeOverride));
}
