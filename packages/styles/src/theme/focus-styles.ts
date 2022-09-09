/*!
 * Original code by Mantinedev
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/tree/master/src/mantine-styles/src/theme/functions/fns/focus-styles
 */

import { SystemStyleObject, ThemeVars } from "../types";

export function focusStyles(vars: ThemeVars): SystemStyleObject {
  return {
    WebkitTapHighlightColor: "transparent",

    "&:focus": {
      outlineOffset: "2px",
      outline: `2px solid ${vars.colors.focusRing}`,
    },

    "&:focus:not(:focus-visible)": {
      outline: "none",
    },
  };
}
