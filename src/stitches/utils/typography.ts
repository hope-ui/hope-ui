export const typography = {
  /**
   * Utility to visually truncating text after a fixed number of lines.
   */
  lineClamp: (value: number) => ({
    overflow: "hidden",
    display: "-webkit-box",
    "-webkit-box-orient": "vertical",
    "-webkit-line-clamp": value,
  }),
};
