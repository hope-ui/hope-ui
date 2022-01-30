import type { PropertyValue } from "@stitches/core";

export const background = {
  /**
   * The CSS `background` property
   */
  bg: (value: PropertyValue<"background">) => ({ background: value }),
};
