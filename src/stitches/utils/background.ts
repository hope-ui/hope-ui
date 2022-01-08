import type { PropertyValue } from "@stitches/core";

export const background = {
  bg: (value: PropertyValue<"background">) => ({ background: value })
};
