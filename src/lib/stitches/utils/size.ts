import type { PropertyValue } from "@stitches/core";

export const size = {
  // width
  w: (value: PropertyValue<"width">) => ({ width: value }),
  minW: (value: PropertyValue<"minWidth">) => ({ minWidth: value }),
  maxW: (value: PropertyValue<"maxWidth">) => ({ maxWidth: value }),

  // height
  h: (value: PropertyValue<"height">) => ({ height: value }),
  minH: (value: PropertyValue<"minHeight">) => ({ minHeight: value }),
  maxH: (value: PropertyValue<"maxHeight">) => ({ maxHeight: value }),

  // width & height
  boxSize: (value: PropertyValue<"width">) => ({ width: value, height: value })
};
