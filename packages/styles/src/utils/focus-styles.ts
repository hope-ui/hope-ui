import { SystemStyleObject, ThemeWithoutMetaData } from "../types";

export function focusStyles(theme: ThemeWithoutMetaData) {
  return (): SystemStyleObject => ({
    WebkitTapHighlightColor: "transparent",

    "&:focus": {
      outlineOffset: 2,
      outline: `2px solid ${theme.colors.primary[theme.colorMode === "dark" ? 600 : 500]}`,
    },

    "&:focus:not(:focus-visible)": {
      outline: "none",
    },
  });
}
