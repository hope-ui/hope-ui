import type { PropertyValue } from "@stitches/core";

export const radii = {
  /**
   * The CSS `border-top-left-radius` and `border-top-right-radius` property
   */
  borderTopRadius: (value: PropertyValue<"borderTopLeftRadius">) => ({
    borderTopLeftRadius: value,
    borderTopRightRadius: value,
  }),

  /**
   * The CSS `border-top-right-radius` and `border-bottom-right-radius` property
   */
  borderRightRadius: (value: PropertyValue<"borderTopRightRadius">) => ({
    borderTopRightRadius: value,
    borderBottomRightRadius: value,
  }),

  /**
   * The CSS `border-bottom-right-radius` and `border-bottom-left-radius` property
   */
  borderBottomRadius: (value: PropertyValue<"borderBottomLeftRadius">) => ({
    borderBottomLeftRadius: value,
    borderBottomRightRadius: value,
  }),

  /**
   * The CSS `border-top-left-radius` and `border-bottom-left-radius` property
   */
  borderLeftRadius: (value: PropertyValue<"borderTopLeftRadius">) => ({
    borderTopLeftRadius: value,
    borderBottomLeftRadius: value,
  }),
};
