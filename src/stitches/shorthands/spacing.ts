import type { PropertyValue } from "@stitches/core";

export const spacing = {
  /**
   * Utility to space items in a horizontal stack
   */
  spaceX: (value: PropertyValue<"marginLeft">) => ({
    "& > * + *": {
      marginLeft: value,
    },
  }),

  /**
   * Utility to space items in a vertial stack
   */
  spaceY: (value: PropertyValue<"marginTop">) => ({
    "& > * + *": {
      marginTop: value,
    },
  }),
};
