import type { PropertyValue } from "@stitches/core";

export const border = {
  // border is border color (see : https://github.com/modulz/stitches/blob/canary/packages/core/src/default/defaultThemeMap.js)
  borderX: (value: PropertyValue<"borderLeft">) => ({
    borderLeft: value,
    borderRight: value
  }),
  borderY: (value: PropertyValue<"borderTop">) => ({
    borderTop: value,
    borderBottom: value
  }),

  // border radius
  borderTopRadius: (value: PropertyValue<"borderRadius">) => ({
    borderTopLeftRadius: value,
    borderTopRightRadius: value
  }),
  borderRightRadius: (value: PropertyValue<"borderRadius">) => ({
    borderTopRightRadius: value,
    borderBottomRightRadius: value
  }),
  borderEndRadius: (value: PropertyValue<"borderRadius">) => ({
    borderTopRightRadius: value,
    borderBottomRightRadius: value
  }),
  borderBottomRadius: (value: PropertyValue<"borderRadius">) => ({
    borderBottomLeftRadius: value,
    borderBottomRightRadius: value
  }),
  borderLeftRadius: (value: PropertyValue<"borderRadius">) => ({
    borderTopLeftRadius: value,
    borderBottomLeftRadius: value
  }),
  borderStartRadius: (value: PropertyValue<"borderRadius">) => ({
    borderTopLeftRadius: value,
    borderBottomLeftRadius: value
  })
};
