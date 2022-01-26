import { VariantProps } from "@stitches/core";

import { spin } from "@/stitches/keyframes";
import { css } from "@/stitches/stitches.config";
import { SystemStyleObject } from "@/stitches/types";

interface SizeVariantConfig {
  height: string;
  paddingX: string;
  fontSize: string;
  iconSize: string;
  spacing: string;
}

function createSizeVariant(config: SizeVariantConfig): SystemStyleObject {
  return {
    height: config.height,
    py: 0,
    px: config.paddingX,
    fontSize: config.fontSize,

    "& svg": {
      boxSize: config.iconSize,
    },

    "& > * + *": {
      marginLeft: config.spacing,
    },

    [`&.${iconButtonStyles}`]: {
      width: config.height,
      padding: "0",
    },
  };
}

interface CompactSizeVariantConfig {
  height: string;
  paddingX: string;
}

function createCompactSizeCompoundVariant(config: CompactSizeVariantConfig): SystemStyleObject {
  return {
    height: config.height,
    py: 0,
    px: config.paddingX,

    [`&.${iconButtonStyles}`]: {
      width: config.height,
      padding: "0",
    },
  };
}

interface FilledCompoundVariantConfig {
  bgColor: string;
  bgColorHover: string;
}

function createFilledCompoundVariant(config: FilledCompoundVariantConfig): SystemStyleObject {
  return {
    backgroundColor: config.bgColor,
    "&:not(:disabled):hover": {
      backgroundColor: config.bgColorHover,
    },
  };
}

interface LightCompoundVariantConfig {
  color: string;
  bgColor: string;
  bgColorHover: string;
}

function createLightCompoundVariant(config: LightCompoundVariantConfig): SystemStyleObject {
  return {
    backgroundColor: config.bgColor,
    color: config.color,
    "&:not(:disabled):hover": {
      backgroundColor: config.bgColorHover,
    },
  };
}

interface OutlineCompoundVariantConfig {
  color: string;
  bgColorHover: string;
}

function createOutlineCompoundVariant(config: OutlineCompoundVariantConfig): SystemStyleObject {
  return {
    borderColor: config.color,
    color: config.color,
    "&:not(:disabled):hover": {
      backgroundColor: config.bgColorHover,
    },
  };
}

interface TextCompoundVariantConfig {
  color: string;
  bgColorHover: string;
}

function createTextCompoundVariant(config: TextCompoundVariantConfig): SystemStyleObject {
  return {
    color: config.color,
    "&:not(:disabled):hover": {
      backgroundColor: config.bgColorHover,
    },
  };
}

export const buttonLoadingIconStyles = css({
  animation: `1000ms linear infinite ${spin}`,
});

export const iconButtonStyles = css({});

export const buttonStyles = css({
  appearance: "none",
  position: "relative",

  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",

  padding: "0",

  fontWeight: "$medium",
  lineHeight: "$none",
  textDecoration: "none",

  cursor: "pointer",
  userSelect: "none",
  outline: "none",
  transition: "color 250ms, background-color 250ms",

  "&:active": {
    transform: "translateY(1px)",
  },

  "&:focus-visible": {
    outline: "2px solid #2563eb",
    outlineOffset: "4px",
  },

  "&:disabled": {
    border: "1px solid transparent",
    backgroundColor: "$neutral100",
    color: "$neutral300",
    cursor: "not-allowed",
  },

  variants: {
    variant: {
      default: {
        border: "1px solid $neutral400",
        backgroundColor: "white",
        color: "$dark600",

        "&:not(:disabled):hover": {
          backgroundColor: "$neutral100",
        },
      },
      filled: {
        border: "1px solid transparent",
        color: "white",
      },
      light: {
        border: "1px solid transparent",
      },
      outline: {
        borderStyle: "solid",
        borderWidth: "1px",
        backgroundColor: "transparent",
      },
      dashed: {
        borderStyle: "dashed",
        borderWidth: "1px",
        backgroundColor: "transparent",
      },
      text: {
        border: "1px solid transparent",
        backgroundColor: "transparent",
      },
    },
    color: {
      primary: {},
      dark: {},
      neutral: {},
      success: {},
      info: {},
      warning: {},
      danger: {},
    },
    size: {
      xs: createSizeVariant({
        height: "$6",
        paddingX: "$2",
        fontSize: "$xs",
        iconSize: "$3_5",
        spacing: "$1",
      }),
      sm: createSizeVariant({
        height: "$8",
        paddingX: "$3",
        fontSize: "$sm",
        iconSize: "$4",
        spacing: "$1_5",
      }),
      md: createSizeVariant({
        height: "$10",
        paddingX: "$4",
        fontSize: "$base",
        iconSize: "$5",
        spacing: "$1_5",
      }),
      lg: createSizeVariant({
        height: "$12",
        paddingX: "$6",
        fontSize: "$lg",
        iconSize: "$6",
        spacing: "$2",
      }),
      xl: createSizeVariant({
        height: "$14",
        paddingX: "$8",
        fontSize: "$xl",
        iconSize: "$7",
        spacing: "$2",
      }),
    },
    radius: {
      none: { borderRadius: "0" },
      xs: { borderRadius: "$xs" },
      sm: { borderRadius: "$sm" },
      md: { borderRadius: "$md" },
      lg: { borderRadius: "$lg" },
      xl: { borderRadius: "$xl" },
      "2xl": { borderRadius: "$2xl" },
      "3xl": { borderRadius: "$3xl" },
      full: { borderRadius: "$full" },
    },
    compact: { true: {} },
    uppercase: {
      true: { textTransform: "uppercase" },
    },
    fullWidth: {
      true: {
        display: "flex",
        width: "100%",
      },
    },
    loading: {
      true: {
        opacity: "0.75",
        cursor: "default",
        pointerEvents: "none",
      },
    },
  },

  compoundVariants: [
    /**
     * Variant filled
     ******************************/
    {
      variant: "filled",
      color: "primary",
      css: createFilledCompoundVariant({ bgColor: "$primary500", bgColorHover: "$primary600" }),
    },
    {
      variant: "filled",
      color: "dark",
      css: createFilledCompoundVariant({ bgColor: "$dark500", bgColorHover: "$dark800" }),
    },
    {
      variant: "filled",
      color: "neutral",
      css: createFilledCompoundVariant({ bgColor: "$neutral500", bgColorHover: "$neutral600" }),
    },
    {
      variant: "filled",
      color: "success",
      css: createFilledCompoundVariant({ bgColor: "$success500", bgColorHover: "$success600" }),
    },
    {
      variant: "filled",
      color: "info",
      css: createFilledCompoundVariant({ bgColor: "$info500", bgColorHover: "$info600" }),
    },
    {
      variant: "filled",
      color: "warning",
      css: createFilledCompoundVariant({ bgColor: "$warning500", bgColorHover: "$warning600" }),
    },
    {
      variant: "filled",
      color: "danger",
      css: createFilledCompoundVariant({ bgColor: "$danger500", bgColorHover: "$danger600" }),
    },
    /**
     * Variant light
     ******************************/
    {
      variant: "light",
      color: "primary",
      css: createLightCompoundVariant({
        color: "$primary600",
        bgColor: "$primary50",
        bgColorHover: "$primary100",
      }),
    },
    {
      variant: "light",
      color: "dark",
      css: createLightCompoundVariant({
        color: "$dark800",
        bgColor: "$dark50",
        bgColorHover: "$dark100",
      }),
    },
    {
      variant: "light",
      color: "neutral",
      css: createLightCompoundVariant({
        color: "$neutral600",
        bgColor: "$neutral100",
        bgColorHover: "$neutral200",
      }),
    },
    {
      variant: "light",
      color: "success",
      css: createLightCompoundVariant({
        color: "$success600",
        bgColor: "$success50",
        bgColorHover: "$success100",
      }),
    },
    {
      variant: "light",
      color: "info",
      css: createLightCompoundVariant({
        color: "$info600",
        bgColor: "$info50",
        bgColorHover: "$info100",
      }),
    },
    {
      variant: "light",
      color: "warning",
      css: createLightCompoundVariant({
        color: "$warning600",
        bgColor: "$warning50",
        bgColorHover: "$warning100",
      }),
    },
    {
      variant: "light",
      color: "danger",
      css: createLightCompoundVariant({
        color: "$danger600",
        bgColor: "$danger50",
        bgColorHover: "$danger100",
      }),
    },
    /**
     * Variant outline
     ******************************/
    {
      variant: "outline",
      color: "primary",
      css: createOutlineCompoundVariant({ color: "$primary600", bgColorHover: "$primary50" }),
    },
    {
      variant: "outline",
      color: "dark",
      css: createOutlineCompoundVariant({ color: "$dark600", bgColorHover: "$dark50" }),
    },
    {
      variant: "outline",
      color: "neutral",
      css: createOutlineCompoundVariant({ color: "$neutral600", bgColorHover: "$neutral100" }),
    },
    {
      variant: "outline",
      color: "success",
      css: createOutlineCompoundVariant({ color: "$success600", bgColorHover: "$success50" }),
    },
    {
      variant: "outline",
      color: "info",
      css: createOutlineCompoundVariant({ color: "$info600", bgColorHover: "$info50" }),
    },
    {
      variant: "outline",
      color: "warning",
      css: createOutlineCompoundVariant({ color: "$warning600", bgColorHover: "$warning50" }),
    },
    {
      variant: "outline",
      color: "danger",
      css: createOutlineCompoundVariant({ color: "$danger600", bgColorHover: "$danger50" }),
    },
    /**
     * Variant dashed
     ******************************/
    {
      variant: "dashed",
      color: "primary",
      css: createOutlineCompoundVariant({ color: "$primary600", bgColorHover: "$primary50" }),
    },
    {
      variant: "dashed",
      color: "dark",
      css: createOutlineCompoundVariant({ color: "$dark600", bgColorHover: "$dark50" }),
    },
    {
      variant: "dashed",
      color: "neutral",
      css: createOutlineCompoundVariant({ color: "$neutral600", bgColorHover: "$neutral100" }),
    },
    {
      variant: "dashed",
      color: "success",
      css: createOutlineCompoundVariant({ color: "$success600", bgColorHover: "$success50" }),
    },
    {
      variant: "dashed",
      color: "info",
      css: createOutlineCompoundVariant({ color: "$info600", bgColorHover: "$info50" }),
    },
    {
      variant: "dashed",
      color: "warning",
      css: createOutlineCompoundVariant({ color: "$warning600", bgColorHover: "$warning50" }),
    },
    {
      variant: "dashed",
      color: "danger",
      css: createOutlineCompoundVariant({ color: "$danger600", bgColorHover: "$danger50" }),
    },
    /**
     * Variant text
     ******************************/
    {
      variant: "text",
      color: "primary",
      css: createTextCompoundVariant({ color: "$primary600", bgColorHover: "$primary50" }),
    },
    {
      variant: "text",
      color: "dark",
      css: createTextCompoundVariant({ color: "$dark600", bgColorHover: "$dark50" }),
    },
    {
      variant: "text",
      color: "neutral",
      css: createTextCompoundVariant({ color: "$neutral600", bgColorHover: "$neutral100" }),
    },
    {
      variant: "text",
      color: "success",
      css: createTextCompoundVariant({ color: "$success600", bgColorHover: "$success50" }),
    },
    {
      variant: "text",
      color: "info",
      css: createTextCompoundVariant({ color: "$info600", bgColorHover: "$info50" }),
    },
    {
      variant: "text",
      color: "warning",
      css: createTextCompoundVariant({ color: "$warning600", bgColorHover: "$warning50" }),
    },
    {
      variant: "text",
      color: "danger",
      css: createTextCompoundVariant({ color: "$danger600", bgColorHover: "$danger50" }),
    },
    /**
     * Compact sizes
     ******************************/
    {
      size: "xs",
      compact: "true",
      css: createCompactSizeCompoundVariant({ height: "$5", paddingX: "$1" }),
    },
    {
      size: "sm",
      compact: "true",
      css: createCompactSizeCompoundVariant({ height: "$6", paddingX: "$1_5" }),
    },
    {
      size: "md",
      compact: "true",
      css: createCompactSizeCompoundVariant({ height: "$7", paddingX: "$1_5" }),
    },
    {
      size: "lg",
      compact: "true",
      css: createCompactSizeCompoundVariant({ height: "$8", paddingX: "$2" }),
    },
    {
      size: "xl",
      compact: "true",
      css: createCompactSizeCompoundVariant({ height: "$9", paddingX: "$2" }),
    },
  ],
});

export type ButtonVariants = VariantProps<typeof buttonStyles>;
