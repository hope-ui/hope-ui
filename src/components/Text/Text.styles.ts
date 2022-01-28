import { VariantProps } from "@stitches/core";

import { css } from "@/theme/stitches.config";
import { utilityStyles } from "@/theme/utilityStyles";

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
    font: {
      sans: { fontFamily: "$sans" },
      serif: { fontFamily: "$serif" },
      mono: { fontFamily: "$mono" },
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
    letterSpacing: {
      tighter: { letterSpacing: "$tighter" },
      tight: { letterSpacing: "$tight" },
      normal: { letterSpacing: "$normal" },
      wide: { letterSpacing: "$wide" },
      wider: { letterSpacing: "$wider" },
      widest: { letterSpacing: "$widest" },
    },
    align: {
      left: { textAlign: "left" },
      right: { textAlign: "right" },
      center: { textAlign: "center" },
      justify: { textAlign: "justify" },
    },
    capitalized: {
      true: { textTransform: "capitalize" },
    },
    uppercased: {
      true: { textTransform: "uppercase" },
    },
    lowercased: {
      true: { textTransform: "lowercase" },
    },
    lineClamp: {
      1: { noOfLines: 1 },
      2: { noOfLines: 2 },
      3: { noOfLines: 3 },
      4: { noOfLines: 4 },
      5: { noOfLines: 5 },
    },
  },
});

export type TextVariants = VariantProps<typeof textStyles>;
