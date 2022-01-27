import { VariantProps } from "@stitches/core";

import { css, theme } from "@/theme/stitches.config";
import { SystemStyleObject } from "@/theme/types";
import { utilityStyles } from "@/theme/utilityStyles";

type ColorVariants = Record<keyof typeof theme.colors, SystemStyleObject>;

function createColorVariants(): ColorVariants {
  return Object.keys(theme.colors).reduce(
    (acc, key) => ({
      ...acc,
      [key]: { color: `$${key}` } as SystemStyleObject,
    }),
    {} as ColorVariants
  );
}

export const textStyles = css(utilityStyles, {
  // Reset
  margin: 0,
  padding: 0,

  variants: {
    size: {
      xs: {
        fontSize: "$xs",
        lineHeight: "$4",
      },
      sm: {
        fontSize: "$sm",
        lineHeight: "$5",
      },
      base: {
        fontSize: "$base",
        lineHeight: "$6",
      },
      lg: {
        fontSize: "$lg",
        lineHeight: "$7",
      },
      xl: {
        fontSize: "$xl",
        lineHeight: "$7",
      },
      "2xl": {
        fontSize: "$2xl",
        lineHeight: "$8",
      },
      "3xl": {
        fontSize: "$3xl",
        lineHeight: "$9",
      },
      "4xl": {
        fontSize: "$4xl",
        lineHeight: "$10",
      },
      "5xl": {
        fontSize: "$5xl",
        lineHeight: "$none",
      },
      "6xl": {
        fontSize: "$6xl",
        lineHeight: "$none",
      },
      "7xl": {
        fontSize: "$7xl",
        lineHeight: "$none",
      },
      "8xl": {
        fontSize: "$8xl",
        lineHeight: "$none",
      },
      "9xl": {
        fontSize: "$9xl",
        lineHeight: "$none",
      },
    },
    weight: {
      hairline: { fontWeight: "$hairline" },
      thin: { fontWeight: "$thin" },
      light: { fontWeight: "$light" },
      normal: { fontWeight: "$normal" },
      medium: { fontWeight: "$medium" },
      semibold: { fontWeight: "$semibold" },
      bold: { fontWeight: "$bold" },
      extrabold: { fontWeight: "$extrabold" },
      black: { fontWeight: "$black" },
    },
    color: createColorVariants(),
    align: {
      left: { textAlign: "left" },
      right: { textAlign: "right" },
      center: { textAlign: "center" },
      justify: { textAlign: "justify" },
    },
    lineClamp: {
      1: { noOfLines: 1 },
      2: { noOfLines: 2 },
      3: { noOfLines: 3 },
      4: { noOfLines: 4 },
      5: { noOfLines: 5 },
    },
  },
  defaultVariants: {
    size: "base",
    weight: "normal",
    color: "dark900",
  },
});

export type TextVariants = VariantProps<typeof textStyles>;
