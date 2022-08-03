import { Theme, ThemeOverride } from "../types";
import { analyzeBreakpoints } from "./breakpoint";
import { focusStyles } from "./focus-styles";
import { mode } from "./mode";
import { rgba } from "./rgba";

export function mergeTheme(currentTheme: Theme, themeOverride?: ThemeOverride): Theme {
  if (!themeOverride) {
    return currentTheme;
  }

  const themeBase = Object.keys(currentTheme).reduce((acc, key) => {
    const currentValue = currentTheme[key as keyof Theme];
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
  }, {} as Theme);

  return {
    ...themeBase,
    fn: {
      mode: mode(themeBase),
      focusStyles: focusStyles(themeBase),
      rgba,
    },
    __breakpoints: analyzeBreakpoints(themeBase.breakpoints),
  };
}
