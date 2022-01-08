import type { PropertyValue } from "@stitches/core";

export const shadow = {
  shadow: (value: PropertyValue<"boxShadow">) => ({ boxShadow: value })
};
