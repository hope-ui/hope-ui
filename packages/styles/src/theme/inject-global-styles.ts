import { globalCss } from "../stitches.config";
import { Theme } from "../types";
import { createGetCssVar } from "../utils";

export function injectGlobalStyles(theme: Theme) {
  const getCssVar = createGetCssVar(theme.cssVarPrefix);

  globalCss({
    "*, *::before, *::after": {
      boxSizing: "border-box",
    },

    html: {
      fontFamily: getCssVar("fonts-sans"),
      lineHeight: getCssVar("lineHeights-base"),
      fontSize: "16px",
    },

    body: {
      margin: 0,
      backgroundColor: getCssVar("colors-background-body"),
      color: getCssVar("colors-text-primary"),
      fontFamily: "inherit",
      lineHeight: "inherit",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
  })();
}
