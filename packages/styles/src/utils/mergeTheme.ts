import { attachFunctions } from "../theme/functions/attachFunctions";
import { HopeTheme, HopeThemeBase, HopeThemeOverride } from "../types";

export function mergeTheme(
  currentTheme: HopeThemeBase,
  themeOverride?: HopeThemeOverride
): HopeThemeBase {
  if (!themeOverride) {
    return currentTheme;
  }

  return Object.keys(currentTheme).reduce((acc, key) => {
    const currentValue = currentTheme[key as keyof HopeThemeBase];
    const overrideValue = themeOverride[key as keyof HopeThemeOverride];

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
  }, {} as HopeThemeBase);
}

export function mergeThemeWithFunctions(
  currentTheme: HopeThemeBase,
  themeOverride?: HopeThemeOverride
): HopeTheme {
  return attachFunctions(mergeTheme(currentTheme, themeOverride));
}
