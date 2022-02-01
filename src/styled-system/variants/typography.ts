import { theme } from "@/theme/stitches.config";
import {
  FontSizeToken,
  FontToken,
  FontWeightToken,
  LetterSpacingToken,
  LineHeightToken,
  ThemeStyleObject,
} from "@/theme/types";

import { UtilityVariant } from "../types";

export function createTypographyUtilityVariants() {
  return {
    fontFamily: Object.keys(theme.fonts).reduce(
      (acc, key) => ({ ...acc, [key]: { fontFamily: `$${key}` } as ThemeStyleObject }),
      {} as UtilityVariant<FontToken>
    ),
    fontSize: Object.keys(theme.fontSizes).reduce(
      (acc, key) => ({ ...acc, [key]: { fontSize: `$${key}` } as ThemeStyleObject }),
      {} as UtilityVariant<FontSizeToken>
    ),
    fontWeight: Object.keys(theme.fontWeights).reduce(
      (acc, key) => ({ ...acc, [key]: { fontWeight: `$${key}` } as ThemeStyleObject }),
      {} as UtilityVariant<FontWeightToken>
    ),
    lineHeight: Object.keys(theme.lineHeights).reduce(
      (acc, key) => ({ ...acc, [key]: { lineHeight: `$${key}` } as ThemeStyleObject }),
      {} as UtilityVariant<LineHeightToken>
    ),
    letterSpacing: Object.keys(theme.letterSpacings).reduce(
      (acc, key) => ({ ...acc, [key]: { letterSpacing: `$${key}` } as ThemeStyleObject }),
      {} as UtilityVariant<LetterSpacingToken>
    ),
    fontStyle: {
      normal: { fontStyle: "normal" } as ThemeStyleObject,
      italic: { fontStyle: "italic" } as ThemeStyleObject,
    },
    textAlign: {
      left: { textAlign: "left" } as ThemeStyleObject,
      right: { textAlign: "right" } as ThemeStyleObject,
      center: { textAlign: "center" } as ThemeStyleObject,
      justify: { textAlign: "justify" } as ThemeStyleObject,
    },
    textTransform: {
      uppercase: { textTransform: "uppercase" } as ThemeStyleObject,
      lowercase: { textTransform: "lowercase" } as ThemeStyleObject,
      capitalize: { textTransform: "capitalize" } as ThemeStyleObject,
      none: { textTransform: "none" } as ThemeStyleObject,
    },
    lineClamp: {
      1: { noOfLines: 1 } as ThemeStyleObject,
      2: { noOfLines: 2 } as ThemeStyleObject,
      3: { noOfLines: 3 } as ThemeStyleObject,
      4: { noOfLines: 4 } as ThemeStyleObject,
      5: { noOfLines: 5 } as ThemeStyleObject,
    },
  };
}
