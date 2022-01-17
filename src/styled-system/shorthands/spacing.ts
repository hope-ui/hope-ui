import type { PropertyValue } from "@stitches/core";

export const spacing = {
  spaceX: (value: PropertyValue<"marginLeft">) => ({
    "& > * + *": {
      marginLeft: value,
    },
  }),
  spaceY: (value: PropertyValue<"marginTop">) => ({
    "& > * + *": {
      marginTop: value,
    },
  }),
};
