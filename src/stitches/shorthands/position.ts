import type { PropertyValue } from "@stitches/core";

export const position = {
  pos: (value: PropertyValue<"position">) => ({ position: value }),
};
