import { style } from "@vanilla-extract/css";

import { DARK_THEME_SELECTOR, vars } from "../_vanilla-extract/theme.css";

const root = style({
  borderRadius: vars.radii.md,
  borderStyle: "solid",
  borderWidth: "1px",
  borderBottomWidth: "3px",

  paddingLeft: "0.4em",
  paddingRight: "0.4em",

  color: vars.colors.common.foreground,
  fontFamily: vars.fonts.mono,
  fontSize: "0.8em",
  fontWeight: vars.fontWeights.bold,
  lineHeight: "normal",
  whiteSpace: "nowrap",

  borderColor: vars.colors.neutral["300"],
  backgroundColor: vars.colors.neutral["100"],

  selectors: {
    [DARK_THEME_SELECTOR]: {
      borderColor: vars.colors.neutral["600"],
      backgroundColor: vars.colors.neutral["800"],
    },
  },
});

export const kbdStyles = { root };
