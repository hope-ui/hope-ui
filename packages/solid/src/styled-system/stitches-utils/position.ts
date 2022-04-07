import type { PropertyValue } from "@stitches/core";

export const position = {
  /**
   * The CSS `position` property
   */
  pos: (value: PropertyValue<"position">) => ({ position: value }),
};
