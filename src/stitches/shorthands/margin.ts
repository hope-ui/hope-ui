import type { PropertyValue } from "@stitches/core";

import { MarginProps } from "../props/marginProps";

export const margin: Record<keyof MarginProps, any> = {
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
