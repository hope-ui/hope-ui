import type { PropertyValue } from "@stitches/core";

export const layout = {
  // display
  d: (value: PropertyValue<"display">) => ({ display: value }),

  // spacing
  spaceX: (value: PropertyValue<"marginLeft">) => ({
    "& > * + *": {
      marginLeft: value
    }
  }),
  spaceY: (value: PropertyValue<"marginTop">) => ({
    "& > * + *": {
      marginTop: value
    }
  })
};
