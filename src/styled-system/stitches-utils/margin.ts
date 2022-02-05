import type { PropertyValue } from "@stitches/core";

export const margin = {
  /**
   * The CSS `margin` property
   */
  m: (value: PropertyValue<"margin">) => ({ margin: value }),

  /**
   * The CSS `margin-top` property
   */
  mt: (value: PropertyValue<"marginTop">) => ({ marginTop: value }),

  /**
   * The CSS `margin-right` property
   */
  mr: (value: PropertyValue<"marginRight">) => ({ marginRight: value }),

  /**
   * The CSS `margin-inline-start` property
   */
  ms: (value: PropertyValue<"marginInlineStart">) => ({ marginInlineStart: value }),

  /**
   * The CSS `margin-bottom` property
   */
  mb: (value: PropertyValue<"marginBottom">) => ({ marginBottom: value }),

  /**
   * The CSS `margin-left`  property
   */
  ml: (value: PropertyValue<"marginLeft">) => ({ marginLeft: value }),

  /**
   * The CSS `margin-inline-end` property
   */
  me: (value: PropertyValue<"marginInlineEnd">) => ({ marginInlineEnd: value }),

  /**
   * The CSS `margin-inline-start` and `margin-inline-end` property
   */
  mx: (value: PropertyValue<"marginInlineStart">) => ({
    marginInlineStart: value,
    marginInlineEnd: value,
  }),

  /**
   * The CSS `margin-top` and `margin-bottom` property
   */
  my: (value: PropertyValue<"marginTop">) => ({ marginTop: value, marginBottom: value }),

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
