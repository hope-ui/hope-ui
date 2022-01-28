import { VariantProps } from "@stitches/core";

import { css } from "@/theme/stitches.config";
import { utilityStyles } from "@/theme/utilityStyles";

export const baseTextStyles = css({
  variants: {
    fontSize: {
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
    fontFamily: {
      sans: { fontFamily: "$sans" },
      serif: { fontFamily: "$serif" },
      mono: { fontFamily: "$mono" },
    },
    fontWeight: {
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
    textAlign: {
      left: { textAlign: "left" },
      right: { textAlign: "right" },
      center: { textAlign: "center" },
      justify: { textAlign: "justify" },
    },
    textTransform: {
      capitalize: { textTransform: "capitalize" },
      uppercase: { textTransform: "uppercase" },
      lowercase: { textTransform: "lowercase" },
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

export const textStyles = css(utilityStyles, baseTextStyles, {
  // Reset
  margin: 0,
  padding: 0,
});

export type BaseTextVariants = VariantProps<typeof baseTextStyles>;

export type TextVariants = VariantProps<typeof textStyles>;

/**
 * Used to splitProps in <Text/> and <Heading/> component.
 */
export const commonTextStyleProps: Array<
  keyof Pick<BaseTextVariants, "letterSpacing" | "textAlign" | "textTransform" | "lineClamp">
> = ["letterSpacing", "textAlign", "textTransform", "lineClamp"];

/**
 * Used to splitProps in <Box/> component.
 */
export const baseTextStyleProps: Array<keyof BaseTextVariants> = [
  ...commonTextStyleProps,
  "fontSize",
  "fontFamily",
  "fontWeight",
];
