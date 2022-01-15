import type { PropertyValue } from "@stitches/core";

export const padding = {
  p: (value: PropertyValue<"padding">) => ({ padding: value }),
  px: (value: PropertyValue<"paddingInlineStart">) => ({
    paddingInlineStart: value,
    paddingInlineEnd: value,
  }),
  py: (value: PropertyValue<"paddingTop">) => ({ paddingTop: value, paddingBottom: value }),
  pt: (value: PropertyValue<"paddingTop">) => ({ paddingTop: value }),
  pr: (value: PropertyValue<"paddingRight">) => ({ paddingRight: value }),
  pe: (value: PropertyValue<"paddingInlineEnd">) => ({ paddingInlineEnd: value }),
  pb: (value: PropertyValue<"paddingBottom">) => ({ paddingBottom: value }),
  pl: (value: PropertyValue<"paddingLeft">) => ({ paddingLeft: value }),
  ps: (value: PropertyValue<"paddingInlineStart">) => ({ paddingInlineStart: value }),
};
