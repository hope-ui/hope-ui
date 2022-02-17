import { globalCss } from "../styled-system/stitches.config";

/**
 * Hope UI css reset
 */
export const resetStyles = globalCss({
  /* 
    1. Use a more-intuitive box-sizing model. 
    2. Set default border width and style to apply border props easily  
  */
  "*, ::before, ::after": {
    boxSizing: "border-box" /* 1 */,
    borderWidth: "0" /* 2  */,
    borderStyle: "solid" /* 2  */,
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
    1. Use theme `sans` font-family.
    2. Use theme `base` line height.
  */
  html: {
    fontFamily: "$sans" /* 1 */,
    lineHeight: "$base" /* 2 */,
    fontSize: "16px",
  },

  /* 
    1. Use theme `neutral` color for text. 
    2. Improve text rendering. 
  */
  body: {
    color: "$neutral12" /* 1 */,
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
  "button, input, textarea, select, optgroup": {
    fontFamily: "inherit",
    fontSize: "100%",
  },

  /* Buttons have a default outline */
  "button:focus": {
    outline: "5px auto -webkit-focus-ring-color",
  },

  /* Anchor are unstyled */
  a: {
    backgroundColor: "transparent",
    color: "inherit",
    textCecoration: "inherit",
  },

  /* -------------------------------------------------------------------------------------------------
   * solid-transition-group classes
   * -----------------------------------------------------------------------------------------------*/

  /* fade */
  ".hope-fade-enter, .hope-fade-exit-to": {
    opacity: 0,
  },
  ".hope-fade-enter-to, .hope-fade-exit": {
    opacity: 1,
  },
  ".hope-fade-enter-active": {
    transition: "opacity 300ms ease-out",
  },
  ".hope-fade-exit-active": {
    transition: "opacity 200ms ease-in",
  },

  /* fade-up */
  ".hope-fade-up-enter, .hope-fade-up-exit-to": {
    opacity: 0,
    transform: "translateY(16px)",
  },
  ".hope-fade-up-enter-to, .hope-fade-up-exit": {
    opacity: 1,
    transform: "translateY(0)",
  },
  ".hope-fade-up-enter-active": {
    transitionProperty: "opacity, transform",
    transitionDuration: "300ms",
    transitionTimingFunction: "ease-out",
  },
  ".hope-fade-up-exit-active": {
    transitionProperty: "opacity, transform",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease-in",
  },

  /* scale */
  ".hope-scale-enter, .hope-scale-exit-to": {
    opacity: 0,
    transform: "scale(0.95)",
  },
  ".hope-scale-enter-to, .hope-scale-exit": {
    opacity: 1,
    transform: "scale(1)",
  },
  ".hope-scale-enter-active": {
    transitionProperty: "opacity, transform",
    transitionDuration: "300ms",
    transitionTimingFunction: "ease-out",
  },
  ".hope-scale-exit-active": {
    transitionProperty: "opacity, transform",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease-in",
  },
});
