import { VariantProps } from "@stitches/core";

import { css } from "@/stitches/stitches.config";

export const textStyles = css({
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
      light: { fontWeight: "$light" },
      normal: { fontWeight: "$normal" },
      medium: { fontWeight: "$medium" },
      semibold: { fontWeight: "$semibold" },
      bold: { fontWeight: "$bold" },
    },
    color: {
      primary: { color: "$primary700" },
      dark: { color: "$dark900" },
      neutral: { color: "$neutral700" },
      success: { color: "$success700" },
      info: { color: "$info700" },
      warning: { color: "$warning700" },
      danger: { color: "$danger700" },
    },
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
    secondary: { true: {} },
  },
  compoundVariants: [
    /* Secondary text
     **********************/
    {
      color: "primary",
      secondary: "true",
      css: { color: "$primary600" },
    },
    {
      color: "dark",
      secondary: "true",
      css: { color: "$dark700" },
    },
    {
      color: "neutral",
      secondary: "true",
      css: { color: "$neutral600" },
    },
    {
      color: "success",
      secondary: "true",
      css: { color: "$success600" },
    },
    {
      color: "info",
      secondary: "true",
      css: { color: "$info600" },
    },
    {
      color: "warning",
      secondary: "true",
      css: { color: "$warning600" },
    },
    {
      color: "danger",
      secondary: "true",
      css: { color: "$danger600" },
    },
  ],
  defaultVariants: {
    size: "base",
    weight: "normal",
    color: "dark",
  },
});

export type TextVariants = VariantProps<typeof textStyles>;
