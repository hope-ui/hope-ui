import { Theme, ThemeWithoutMetaData } from "../types";
import { analyzeBreakpoints } from "./breakpoint";
import { focusStyles } from "./focus-styles";
import { mode } from "./mode";
import { rgba } from "./rgba";

export function attachMetaData(themeBase: ThemeWithoutMetaData): Theme {
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
