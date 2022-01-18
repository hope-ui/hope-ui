import { SystemTokens } from "@/types/stitches";

import { stitches } from "../stitches.config";
import { modernNormalizeCSS } from "./modernNormalizeCSS";

/**
 * Apply modern-normalize css reset and Hope UI global base styles
 */
export function applyGlobalBaseStyles(tokens: SystemTokens) {
  const baseStyles = stitches.globalCss({
    /* Remove default margin. */
    "*": {
      margin: 0,
    },

    /* Allow percentage-based heights in the application. */
    "html, body": {
      height: "100%",
    },

    /* 
    1. Use theme dark color for text.
    2. Use theme `sans` font-family.
    3. Use theme base line height.
  */
    html: {
      color: tokens.colors.dark900 /* 1 */,
      fontFamily: tokens.fonts.sans /* 2 */,
      lineHeight: tokens.lineHeights.base /* 3 */,
      fontSize: "16px",
    },

    /* Improve text rendering. */
    body: {
      fontFamily: "inherit",
      lineHeight: "inherit",
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale",
    },

    /* Headings are unstyled. */
    "h1, h2, h3, h4, h5, h6": {
      fontSize: "inherit",
      fontWeight: "inherit",
    },

    /* Avoid text overflows. */
    "p, h1, h2, h3, h4, h5, h6": {
      overflowWrap: "break-word",
    },

    /* Lists are unstyled.
     Unstyled lists are not announced as lists by VoiceOver.
     If your content is truly a list add a “list” role to the element. 
  */
    "ol, ul": {
      listStyle: "none",
      margin: 0,
      padding: 0,
    },

    /* Improve media defaults. */
    "img, svg": {
      display: "block",
      maxWidth: "100%",
    },

    /* Buttons have a default outline */
    "button:focus-visible": {
      outline: "5px auto -webkit-focus-ring-color",
    },
  });

  modernNormalizeCSS();
  baseStyles();
}
