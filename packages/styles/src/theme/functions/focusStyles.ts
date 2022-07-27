import type { CSSObject, HopeThemeBase } from "../../types";

export function focusStyles(theme: HopeThemeBase) {
  return (): CSSObject => ({
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
  });
}
