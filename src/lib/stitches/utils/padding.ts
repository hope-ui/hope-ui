import type { PropertyValue } from "@stitches/core";

export type PaddingValue = PropertyValue<"padding">;

export const padding = {
  p: (value: PaddingValue) => ({ padding: value }),
  pt: (value: PaddingValue) => ({ paddingTop: value }),
  pr: (value: PaddingValue) => ({ paddingRight: value }),
  pe: (value: PaddingValue) => ({ paddingInlineEnd: value }),
  pb: (value: PaddingValue) => ({ paddingBottom: value }),
  pl: (value: PaddingValue) => ({ paddingLeft: value }),
  ps: (value: PaddingValue) => ({ paddingInlineStart: value }),
  px: (value: PaddingValue) => ({
    // Use padding-inline-start and padding-inline-end to ensure the generated styles are RTL-friendly
    paddingInlineStart: value,
    paddingInlineEnd: value
  }),
  py: (value: PaddingValue) => ({
    paddingTop: value,
    paddingBottom: value
  })
};
