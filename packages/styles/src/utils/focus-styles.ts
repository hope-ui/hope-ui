import { ThemeBase } from "../types";
import { CSSObject } from "../stitches.config";

export function focusStyles(theme: ThemeBase): CSSObject {
  return {
    WebkitTapHighlightColor: "transparent",

    "&:focus": {
      outlineOffset: 2,
      outline: `2px solid ${
        theme.colors[theme.primaryColor][theme.colorMode === "dark" ? 600 : 500]
      }`,
    },

    "&:focus:not(:focus-visible)": {
      outline: "none",
    },
  };
}
