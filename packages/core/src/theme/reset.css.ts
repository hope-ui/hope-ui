import { globalStyle } from "@vanilla-extract/css";

import { rgbVar } from "../utils/css";
import { vars } from "./contract.css";

globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
});

globalStyle("html", {
  fontFamily: vars.fonts.sans,
  lineHeight: vars.lineHeights.base,
  fontSize: "16px",
});

globalStyle("body", {
  margin: 0,
  backgroundColor: rgbVar(vars.colors.background),
  color: rgbVar(vars.colors.neutral[12]),
  fontFamily: "inherit",
  lineHeight: "inherit",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
});
