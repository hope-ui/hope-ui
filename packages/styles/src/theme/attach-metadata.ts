import { Theme, ThemeBase } from "../types";
import { analyzeBreakpoints } from "../utils/breakpoint";
import { focusStyles } from "./functions/focus-styles";
import { rgba } from "./functions/rgba";

export function attachMetadata(themeBase: ThemeBase): Theme {
  return {
    ...themeBase,
    __breakpoints: analyzeBreakpoints(themeBase.breakpoints),
    fn: {
      focusStyles: focusStyles(themeBase),
      rgba,
    },
  };
}
