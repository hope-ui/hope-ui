/*!
 * Original code by Mantinedev
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/tree/master/src/mantine-styles/src/theme/functions/fns/focus-styles
 */

export const focusStyles = {
  WebkitTapHighlightColor: "transparent",

  "&:focus": {
    outlineOffset: 2,
    outline: "2px solid var(--hope-colors-focus-ring)",
  },

  "&:focus:not(:focus-visible)": {
    outline: "none",
  },
};
