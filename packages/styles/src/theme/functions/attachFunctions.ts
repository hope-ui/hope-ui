import { HopeTheme, HopeThemeBase } from "../../types";
import { largerThan, smallerThan } from "./breakpoints";
import { focusStyles } from "./focusStyles";
import { rgba } from "./rgba";

export function attachFunctions(themeBase: HopeThemeBase): HopeTheme {
  return {
    ...themeBase,
    fn: {
      focusStyles: focusStyles(themeBase),
      largerThan: largerThan(themeBase),
      smallerThan: smallerThan(themeBase),
      rgba,
    },
  };
}
