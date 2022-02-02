import type { PropertyValue } from "@stitches/core";

export const border = {
  /**
   * The CSS `border-right` and `border-left` property
   */
  borderX: (value: PropertyValue<"borderLeft">) => ({
    borderLeft: value,
    borderRight: value,
  }),

  /**
   * The CSS `border-top` and `border-bottom` property
   */
  borderY: (value: PropertyValue<"borderTop">) => ({
    borderTop: value,
    borderBottom: value,
  }),
};
