import { Theme, ThemeBase } from "../types";
import { analyzeBreakpoints } from "../utils/breakpoint";

export function attachMetadata(themeBase: ThemeBase): Theme {
  return {
    ...themeBase,
    __breakpoints: analyzeBreakpoints(themeBase.breakpoints),
  };
}
