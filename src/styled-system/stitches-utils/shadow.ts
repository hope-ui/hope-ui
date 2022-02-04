import type { PropertyValue } from "@stitches/core";

export const shadow = {
  /**
   * The CSS `box-shadow` property
   */
  shadow: (value: PropertyValue<"boxShadow">) => ({ boxShadow: value }),
};
