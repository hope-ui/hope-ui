import { stitches } from "./stitches.config";
import { SystemTokens } from "./types";

/**
 * Apply Hope UI global base styles
 */
export function applyGlobalBaseStyles(tokens: SystemTokens) {
  const baseStyles = stitches.globalCss({
    /* 
     1. Use a more-intuitive box-sizing model. 
     2. Override the default border in order to make it easy to add a border by simply adding the `border` prop 
    */
    "*, ::before, ::after": {
      boxSizing: "border-box" /* 1 */,
      borderWidth: 0 /* 2 */,
      borderStyle: "solid" /* 2 */,
    },

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

    /* Improve media defaults. */
    "img, picture, video, canvas, svg": {
      display: "block",
      maxWidth: "100%",
    },

    /* Remove built-in form typography styles */
    "input, button, textarea, select": {
      font: "inherit",
    },

    /* Buttons have a default outline */
    "button:focus-visible": {
      outline: "5px auto -webkit-focus-ring-color",
    },
  });

  baseStyles();
}
