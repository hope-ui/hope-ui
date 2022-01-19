import type { PropertyValue } from "@stitches/core";

import { PaddingProps } from "../props/paddingProps";

export const padding: Record<keyof PaddingProps, any> = {
  /**
   * Padding on top, left, bottom and right
   */
  p: (value: PropertyValue<"padding">) => ({ padding: value }),

  /**
   * Padding onleft and right
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
