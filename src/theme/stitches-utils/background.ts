import type { PropertyValue } from "@stitches/core";

export const background = {
  /**
   * The CSS `background` property
   */
  bg: (value: PropertyValue<"background">) => ({ background: value }),

  /**
   * The CSS `background-color` property
   */
  bgColor: (value: PropertyValue<"backgroundColor">) => ({ backgroundColor: value }),
};
