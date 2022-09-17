/*!
 * Portions of this file are based on code from joshua comeau css reset.
 *
 * Credits to Joshua Comeau:
 * https://www.joshwcomeau.com/css/custom-css-reset/#the-css-reset
 */

import { globalCss } from "../stitches.config";
import { ThemeVars } from "../types";

/** Hope UI global CSS reset. */
export function injectCssReset(vars: ThemeVars) {
  globalCss({
    // Use a more-intuitive box-sizing model.
    "*, *::before, *::after": {
      boxSizing: "border-box",
    },

    // Remove default margin.
    "*": {
      margin: 0,
    },

    // Use theme sans-serif font-family and accessible line-height.
    html: {
      fontFamily: vars.fonts.sans,
      lineHeight: vars.lineHeights.base,
      fontSize: "16px",
    },

    // Use theme `background` and `foreground` colors, improve text rendering.
    body: {
      backgroundColor: vars.colors.common.background,
      color: vars.colors.common.foreground,
      fontFamily: "inherit",
      lineHeight: "inherit",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },

    // Improve media defaults.
    "img, picture, video, canvas, svg": {
      display: "block",
      maxWidth: "100%",
    },

    // Remove built-in form typography styles.
    "button, input, textarea, select": {
      font: "inherit",
    },

    // Remove built-in headings typography styles.
    "h1, h2, h3, h4, h5, h6": {
      font: "inherit",
    },

    /* Avoid text overflows. */
    "p, h1, h2, h3, h4, h5, h6": {
      overflowWrap: "break-word",
    },
  })();
}
