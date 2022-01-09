import type { PropertyValue } from "@stitches/core";

export type MarginValue = PropertyValue<"margin">;

export const margin = {
  m: (value: MarginValue) => ({ margin: value }),
  mt: (value: MarginValue) => ({ marginTop: value }),
  mr: (value: MarginValue) => ({ marginRight: value }),
  me: (value: MarginValue) => ({ marginInlineEnd: value }),
  mb: (value: MarginValue) => ({ marginBottom: value }),
  ml: (value: MarginValue) => ({ marginLeft: value }),
  ms: (value: MarginValue) => ({ marginInlineStart: value }),
  mx: (value: MarginValue) => ({
    // Use margin-inline-start and margin-inline-end to ensure the generated styles are RTL-friendly
    marginInlineStart: value,
    marginInlineEnd: value
  }),
  my: (value: MarginValue) => ({
    marginTop: value,
    marginBottom: value
  })
};
