import { globalCss } from "../stitches.config";
import { ThemeVars } from "../types";

/** Hope UI global CSS reset. */
export function injectCssReset(vars: ThemeVars) {
  globalCss({
    "*, *::before, *::after": {
      boxSizing: "border-box",
    },

    "*": {
      margin: 0,
    },

    html: {
      fontFamily: vars.fonts.sans,
      lineHeight: vars.lineHeights.base,
      fontSize: "16px",
    },

    body: {
      margin: 0,
      backgroundColor: vars.colors.background.body,
      color: vars.colors.text.primary,
      fontFamily: "inherit",
      lineHeight: "inherit",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
  })();
}
