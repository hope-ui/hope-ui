import { globalCss } from "./stitches.config";

export const globalStyles = globalCss({
  /* Use a more-intuitive box-sizing model. */
  "*, *::before, *::after": {
    boxSizing: "border-box",
  },

  /* Remove default margin. */
  "*": {
    margin: 0,
  },

  /* Allow percentage-based heights in the application. */
  "html, body": {
    height: "100%",
  },

  /* Use theme `sans` font-family, line-height & dark color for text. */
  html: {
    color: "$dark900",
    fontFamily: "$sans",
    lineHeight: "$base",
    fontSize: "16px",
  },

  /* Improve text rendering. */
  body: {
    fontFamily: "inherit",
    lineHeight: "inherit",
    "-webkit-font-smoothing": "antialiased",
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
  "img, picture, video, canvas, svg": {
    display: "block",
    maxWidth: "100%",
  },

  /* Remove built-in form typography styles. */
  "input, button, textarea, select": {
    font: "inherit",
  },
});
