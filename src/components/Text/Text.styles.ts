import { css } from "@/stitches/stitches.config";

export const text = css({
  variants: {
    font: {
      sans: { fontFamily: "$sans" },
      serif: { fontFamily: "$serif" },
      mono: { fontFamily: "$mono" },
    },
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
    color: {
      primary: { color: "$primary700" },
      dark: { color: "$dark900" },
      neutral: { color: "$neutral700" },
      success: { color: "$success700" },
      info: { color: "$info700" },
      warning: { color: "$warning700" },
      danger: { color: "$danger700" },
    },
    lineClamp: {
      1: { noOfLines: 1 },
      2: { noOfLines: 2 },
      3: { noOfLines: 3 },
      4: { noOfLines: 4 },
      5: { noOfLines: 5 },
    },
    align: {
      left: { textAlign: "left" },
      right: { textAlign: "right" },
      center: { textAlign: "center" },
      justify: { textAlign: "justify" },
    },
    capitalize: { true: { textTransform: "capitalize" } },
    uppercase: { true: { textTransform: "uppercase" } },
    lowercase: { true: { textTransform: "lowercase" } },
    secondary: { true: {} },
    tertiary: { true: {} },
  },
  compoundVariants: [
    /* Secondary text
     **********************/
    {
      color: "primary",
      secondary: "true",
      css: { color: "$primary500" },
    },
    {
      color: "dark",
      secondary: "true",
      css: { color: "$dark700" },
    },
    {
      color: "neutral",
      secondary: "true",
      css: { color: "$neutral500" },
    },
    {
      color: "success",
      secondary: "true",
      css: { color: "$success500" },
    },
    {
      color: "info",
      secondary: "true",
      css: { color: "$info500" },
    },
    {
      color: "warning",
      secondary: "true",
      css: { color: "$warning500" },
    },
    {
      color: "danger",
      secondary: "true",
      css: { color: "$danger500" },
    },
    /* Tertiary text
     **********************/
    {
      color: "primary",
      tertiary: "true",
      css: { color: "$primary300" },
    },
    {
      color: "dark",
      tertiary: "true",
      css: { color: "$dark500" },
    },
    {
      color: "neutral",
      tertiary: "true",
      css: { color: "$neutral300" },
    },
    {
      color: "success",
      tertiary: "true",
      css: { color: "$success300" },
    },
    {
      color: "info",
      tertiary: "true",
      css: { color: "$info300" },
    },
    {
      color: "warning",
      tertiary: "true",
      css: { color: "$warning300" },
    },
    {
      color: "danger",
      tertiary: "true",
      css: { color: "$danger300" },
    },
  ],
  defaultVariants: {
    font: "sans",
    size: "base",
    weight: "normal",
    color: "dark",
  },
});
