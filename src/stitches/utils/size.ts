import type { PropertyValue } from "@stitches/core";

export const size = {
  /**
   * The CSS `width` property
   */
  w: (value: PropertyValue<"width">) => ({ width: value }),

  /**
   * The CSS `min-width` property
   */
  minW: (value: PropertyValue<"minWidth">) => ({ minWidth: value }),

  /**
   * The CSS `max-width` property
   */
  maxW: (value: PropertyValue<"maxWidth">) => ({ maxWidth: value }),

  /**
   * The CSS `height` property
   */
  h: (value: PropertyValue<"height">) => ({ height: value }),

  /**
   * The CSS `min-height` property
   */
  minH: (value: PropertyValue<"minHeight">) => ({ minHeight: value }),

  /**
   * The CSS `max-height` property
   */
  maxH: (value: PropertyValue<"maxHeight">) => ({ maxHeight: value }),

  /**
   * The CSS `width` and `height` property
   */
  boxSize: (value: PropertyValue<"width">) => ({ width: value, height: value }),
};
