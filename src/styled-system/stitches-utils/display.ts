import type { PropertyValue } from "@stitches/core";

export const display = {
  /**
   * The CSS `display` property
   */
  d: (value: PropertyValue<"display">) => ({ display: value }),
};
