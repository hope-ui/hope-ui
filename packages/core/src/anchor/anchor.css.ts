import { style } from "@vanilla-extract/css";

import { focusVisibleStyles } from "../_vanilla-extract/theme.css";

const root = style({
  position: "relative",
  outline: "none",
  backgroundColor: "transparent",
  color: "inherit",
  textDecoration: "inherit",
  cursor: "pointer",
  transition: "text-decoration 250ms",

  ":hover": {
    textDecoration: "underline",
  },

  ...focusVisibleStyles,
});

export const anchorStyles = {
  root,
};
