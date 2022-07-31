import { Theme, ThemeBase } from "../../types";
import { largerThan, smallerThan } from "./breakpoints";
import { colorModeValue } from "./color-mode-value";
import { focusStyles } from "./focus-styles";
import { rgba } from "./rgba";

export function attachFunctions(themeBase: ThemeBase): Theme {
  return {
    ...themeBase,
    fn: {
      focusStyles: focusStyles(themeBase),
      colorModeValue: colorModeValue(themeBase),
      largerThan: largerThan(themeBase),
      smallerThan: smallerThan(themeBase),
      rgba,
    },
  };
}
