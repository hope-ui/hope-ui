import type { PropertyValue } from "@stitches/core";

export const margin = {
  m: (value: PropertyValue<"margin">) => ({ margin: value }),
  mx: (value: PropertyValue<"marginInlineStart">) => ({
    marginInlineStart: value,
    marginInlineEnd: value,
  }),
  my: (value: PropertyValue<"marginTop">) => ({ marginTop: value, marginBottom: value }),
  mt: (value: PropertyValue<"marginTop">) => ({ marginTop: value }),
  mr: (value: PropertyValue<"marginRight">) => ({ marginRight: value }),
  mb: (value: PropertyValue<"marginBottom">) => ({ marginBottom: value }),
  ml: (value: PropertyValue<"marginLeft">) => ({ marginLeft: value }),
};
