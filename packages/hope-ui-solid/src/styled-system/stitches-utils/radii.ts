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
   * The CSS `border-start-start-radius` and `border-end-start-radius` property
   */
  borderStartRadius: (value: PropertyValue<"borderStartStartRadius">) => ({
    borderStartStartRadius: value,
    borderEndStartRadius: value,
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

  /**
   * The CSS `border-start-end-radius` and `border-end-end-radius` property
   */
  borderEndRadius: (value: PropertyValue<"borderStartEndRadius">) => ({
    borderStartEndRadius: value,
    borderEndEndRadius: value,
  }),

  /**
   * The CSS `border-radius` property
   */
  rounded: (value: PropertyValue<"borderRadius">) => ({
    borderRadius: value,
  }),

  /**
   * The CSS `border-top-left-radius` and `border-top-right-radius` property
   */
  roundedTop: (value: PropertyValue<"borderTopLeftRadius">) => ({
    borderTopLeftRadius: value,
    borderTopRightRadius: value,
  }),

  /**
   * The CSS `border-top-right-radius` and `border-bottom-right-radius` property
   */
  roundedRight: (value: PropertyValue<"borderTopRightRadius">) => ({
    borderTopRightRadius: value,
    borderBottomRightRadius: value,
  }),

  /**
   * The CSS `border-start-start-radius` and `border-end-start-radius` property
   */
  roundedStart: (value: PropertyValue<"borderStartStartRadius">) => ({
    borderStartStartRadius: value,
    borderEndStartRadius: value,
  }),

  /**
   * The CSS `border-bottom-right-radius` and `border-bottom-left-radius` property
   */
  roundedBottom: (value: PropertyValue<"borderBottomLeftRadius">) => ({
    borderBottomLeftRadius: value,
    borderBottomRightRadius: value,
  }),

  /**
   * The CSS `border-top-left-radius` and `border-bottom-left-radius` property
   */
  roundedLeft: (value: PropertyValue<"borderTopLeftRadius">) => ({
    borderTopLeftRadius: value,
    borderBottomLeftRadius: value,
  }),

  /**
   * The CSS `border-start-end-radius` and `border-end-end-radius` property
   */
  roundedEnd: (value: PropertyValue<"borderStartEndRadius">) => ({
    borderStartEndRadius: value,
    borderEndEndRadius: value,
  }),
};
