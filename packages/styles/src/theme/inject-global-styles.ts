import { globalCss } from "../stitches.config";
import { ThemeVars } from "../types";

export function injectGlobalStyles(vars: ThemeVars) {
  globalCss({
    "*, *::before, *::after": {
      boxSizing: "border-box",
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
