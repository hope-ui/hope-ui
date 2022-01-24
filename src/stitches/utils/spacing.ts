import type { PropertyValue } from "@stitches/core";

export const margin = {
  /**
   * Margin on top, left, bottom and right
   */
  m: (value: PropertyValue<"margin">) => ({ margin: value }),

  /**
   * Margin on left and right
   */
  mx: (value: PropertyValue<"marginInlineStart">) => ({
    marginInlineStart: value,
    marginInlineEnd: value,
  }),

  /**
   * Margin on top and bottom
   */
  my: (value: PropertyValue<"marginTop">) => ({ marginTop: value, marginBottom: value }),

  /**
   * Margin on top
   */
  mt: (value: PropertyValue<"marginTop">) => ({ marginTop: value }),

  /**
   * Margin on right
   */
  mr: (value: PropertyValue<"marginRight">) => ({ marginRight: value }),

  /**
   * Margin on bottom
   */
  mb: (value: PropertyValue<"marginBottom">) => ({ marginBottom: value }),

  /**
   * Margin on left
   */
  ml: (value: PropertyValue<"marginLeft">) => ({ marginLeft: value }),
};

export const padding = {
  /**
   * Padding on top, left, bottom and right
   */
  p: (value: PropertyValue<"padding">) => ({ padding: value }),

  /**
   * Padding on left and right
   */
  px: (value: PropertyValue<"paddingInlineStart">) => ({
    paddingInlineStart: value,
    paddingInlineEnd: value,
  }),

  /**
   * Padding on top and bottom
   */
  py: (value: PropertyValue<"paddingTop">) => ({ paddingTop: value, paddingBottom: value }),

  /**
   * Padding on top
   */
  pt: (value: PropertyValue<"paddingTop">) => ({ paddingTop: value }),

  /**
   * Padding on right
   */
  pr: (value: PropertyValue<"paddingRight">) => ({ paddingRight: value }),

  /**
   * Padding on bottom
   */
  pb: (value: PropertyValue<"paddingBottom">) => ({ paddingBottom: value }),

  /**
   * Padding on left
   */
  pl: (value: PropertyValue<"paddingLeft">) => ({ paddingLeft: value }),
};

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
