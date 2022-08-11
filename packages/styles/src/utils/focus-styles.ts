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
