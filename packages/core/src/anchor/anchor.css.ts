import { style } from "@vanilla-extract/css";

import { focusVisibleStyles } from "../vanilla-extract.css";

const root = style({
  position: "relative",
  outline: "none",
  backgroundColor: "transparent",
  color: "inherit",
  textDecoration: "inherit",
  cursor: "pointer",
  transition: "text-decoration 250ms",
  WebkitTapHighlightColor: "transparent",

  ":hover": {
    textDecoration: "underline",
  },

  selectors: {
    ...focusVisibleStyles,
  },
});

export const anchorStyles = {
  root,
};
