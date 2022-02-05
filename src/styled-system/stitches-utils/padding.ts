import type { PropertyValue } from "@stitches/core";

export const padding = {
  /**
   * The CSS `padding` property
   */
  p: (value: PropertyValue<"padding">) => ({ padding: value }),

  /**
   * The CSS `padding-top` property
   */
  pt: (value: PropertyValue<"paddingTop">) => ({ paddingTop: value }),

  /**
   * The CSS `padding-right` property
   */
  pr: (value: PropertyValue<"paddingRight">) => ({ paddingRight: value }),

  /**
   * The CSS `padding-inline-start` property
   */
  ps: (value: PropertyValue<"paddingInlineStart">) => ({ paddingInlineStart: value }),

  /**
   * The CSS `padding-bottom` property
   */
  pb: (value: PropertyValue<"paddingBottom">) => ({ paddingBottom: value }),

  /**
   * The CSS `padding-left`  property
   */
  pl: (value: PropertyValue<"paddingLeft">) => ({ paddingLeft: value }),

  /**
   * The CSS `padding-inline-end` property
   */
  pe: (value: PropertyValue<"paddingInlineEnd">) => ({ paddingInlineEnd: value }),

  /**
   * The CSS `padding-inline-start` and `padding-inline-end` property
   */
  px: (value: PropertyValue<"paddingInlineStart">) => ({
    paddingInlineStart: value,
    paddingInlineEnd: value,
  }),

  /**
   * The CSS `padding-top` and `padding-bottom` property
   */
  py: (value: PropertyValue<"paddingTop">) => ({ paddingTop: value, paddingBottom: value }),
};
