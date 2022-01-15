import type { PropertyValue } from "@stitches/core";

export const border = {
  // border radius
  borderTopRadius: (value: PropertyValue<"borderTopLeftRadius">) => ({
    borderTopLeftRadius: value,
    borderTopRightRadius: value,
  }),
  borderRightRadius: (value: PropertyValue<"borderTopRightRadius">) => ({
    borderTopRightRadius: value,
    borderBottomRightRadius: value,
  }),
  borderBottomRadius: (value: PropertyValue<"borderBottomLeftRadius">) => ({
    borderBottomLeftRadius: value,
    borderBottomRightRadius: value,
  }),
  borderLeftRadius: (value: PropertyValue<"borderTopLeftRadius">) => ({
    borderTopLeftRadius: value,
    borderBottomLeftRadius: value,
  }),

  // border is border color (see : https://github.com/modulz/stitches/blob/canary/packages/core/src/default/defaultThemeMap.js)
  borderX: (value: PropertyValue<"borderLeft">) => ({
    borderLeft: value,
    borderRight: value,
  }),
  borderY: (value: PropertyValue<"borderTop">) => ({
    borderTop: value,
    borderBottom: value,
  }),
};
