import { SystemStyleObject, theme } from "@/theme";

import { UtilityVariant } from "../types";

export function createTypographyUtilityVariants() {
  return {
    fontFamily: Object.keys(theme.fonts).reduce(
      (acc, key) => ({ ...acc, [key]: { fontFamily: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.fonts>
    ),
    fontSize: Object.keys(theme.fontSizes).reduce(
      (acc, key) => ({ ...acc, [key]: { fontSize: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.fontSizes>
    ),
    fontWeight: Object.keys(theme.fontWeights).reduce(
      (acc, key) => ({ ...acc, [key]: { fontWeight: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.fontWeights>
    ),
    lineHeight: Object.keys(theme.lineHeights).reduce(
      (acc, key) => ({ ...acc, [key]: { lineHeight: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.lineHeights>
    ),
    letterSpacing: Object.keys(theme.letterSpacings).reduce(
      (acc, key) => ({ ...acc, [key]: { letterSpacing: `$${key}` } as SystemStyleObject }),
      {} as UtilityVariant<keyof typeof theme.letterSpacings>
    ),
    fontStyle: {
      normal: { fontStyle: "normal" } as SystemStyleObject,
      italic: { fontStyle: "italic" } as SystemStyleObject,
    },
    textAlign: {
      left: { textAlign: "left" } as SystemStyleObject,
      right: { textAlign: "right" } as SystemStyleObject,
      center: { textAlign: "center" } as SystemStyleObject,
      justify: { textAlign: "justify" } as SystemStyleObject,
    },
    textTransform: {
      uppercase: { textTransform: "uppercase" } as SystemStyleObject,
      lowercase: { textTransform: "lowercase" } as SystemStyleObject,
      capitalize: { textTransform: "capitalize" } as SystemStyleObject,
      none: { textTransform: "none" } as SystemStyleObject,
    },
    lineClamp: {
      1: { noOfLines: 1 } as SystemStyleObject,
      2: { noOfLines: 2 } as SystemStyleObject,
      3: { noOfLines: 3 } as SystemStyleObject,
      4: { noOfLines: 4 } as SystemStyleObject,
      5: { noOfLines: 5 } as SystemStyleObject,
    },
  };
}
