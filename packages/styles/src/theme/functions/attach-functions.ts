import { Theme, ThemeBase } from "../../types";
import { focusStyles } from "./focus-styles";
import { rgba } from "./rgba";

export function attachFunctions(themeBase: ThemeBase): Theme {
  return {
    ...themeBase,
    fn: {
      focusStyles: focusStyles(themeBase),
      rgba,
    },
  };
}
