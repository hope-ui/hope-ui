import { globalStyle } from "@vanilla-extract/css";

import { rgbVar } from "../utils/css";
import { vars } from "./theme.css";

globalStyle("*, *::before, *::after", {
  /* Use a more-intuitive box-sizing model. */
  boxSizing: "border-box",
});

globalStyle("html", {
  fontFamily: vars.fonts.sans,
  fontSize: "16px",
  lineHeight: 1.5,
});

globalStyle("body", {
  color: rgbVar(vars.colors.neutral[800]),
  fontFamily: "inherit",
  lineHeight: "inherit",

  /* Improve text rendering */
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
});
