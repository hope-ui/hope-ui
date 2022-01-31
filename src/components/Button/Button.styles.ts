import { VariantProps } from "@stitches/core";

import { spin } from "@/theme/keyframes";
import { css } from "@/theme/stitches.config";
import { SystemStyleObject } from "@/theme/types";

export const buttonLoadingIconStyles = css({
  animation: `1000ms linear infinite ${spin}`,
});

export const iconButtonStyles = css();

/* -------------------------------------------------------------------------------------------------
 * Size
 * -----------------------------------------------------------------------------------------------*/

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

/* -------------------------------------------------------------------------------------------------
 * Variant - solid
 * -----------------------------------------------------------------------------------------------*/

interface SolidCompoundVariantConfig {
  color: string;
  bgColor: string;
  bgColorHover: string;
}

function createSolidCompoundVariant(config: SolidCompoundVariantConfig): SystemStyleObject {
  return {
    backgroundColor: config.bgColor,
    color: config.color,

    "&:not(:disabled):hover": {
      backgroundColor: config.bgColorHover,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Variant - subtle
 * -----------------------------------------------------------------------------------------------*/

interface SubtleCompoundVariantConfig {
  color: string;
  bgColor: string;
  bgColorHover: string;
}

function createSubtleCompoundVariant(config: SubtleCompoundVariantConfig): SystemStyleObject {
  return {
    backgroundColor: config.bgColor,
    color: config.color,

    "&:not(:disabled):hover": {
      backgroundColor: config.bgColorHover,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Variant - outline
 * -----------------------------------------------------------------------------------------------*/

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

/* -------------------------------------------------------------------------------------------------
 * Variant - ghost
 * -----------------------------------------------------------------------------------------------*/

interface GhostCompoundVariantConfig {
  color: string;
  bgColorHover: string;
}

function createGhostCompoundVariant(config: GhostCompoundVariantConfig): SystemStyleObject {
  return {
    color: config.color,

    "&:not(:disabled):hover": {
      backgroundColor: config.bgColorHover,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Styles
 * -----------------------------------------------------------------------------------------------*/

export const buttonStyles = css({
  appearance: "none",
  position: "relative",

  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",

  outline: "none",

  padding: "0",

  fontWeight: "$semibold",
  lineHeight: "$none",
  textDecoration: "none",

  cursor: "pointer",
  userSelect: "none",
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
    darkMode: { true: {} },
    variant: {
      default: {},
      solid: {
        border: "1px solid transparent",
      },
      subtle: {
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
      ghost: {
        border: "1px solid transparent",
        backgroundColor: "transparent",
      },
    },
    colorScheme: {
      primary: {},
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
    compact: { true: {} },
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
     * Variant default - light mode
     ******************************/
    {
      variant: "default",
      darkMode: false,
      css: {
        border: "1px solid $neutral400",
        backgroundColor: "$white",
        color: "$dark600",

        "&:not(:disabled):hover": {
          backgroundColor: "$neutral100",
        },
      },
    },
    /**
     * Variant default - dark mode
     ******************************/
    {
      variant: "default",
      darkMode: true,
      css: {
        border: "1px solid $dark500",
        backgroundColor: "$dark500",
        color: "$whiteAlpha900",

        "&:not(:disabled):hover": {
          backgroundColor: "$dark400",
        },
      },
    },
    /**
     * Variant solid - light mode
     ******************************/
    {
      variant: "solid",
      colorScheme: "primary",
      css: createSolidCompoundVariant({
        color: "$white",
        bgColor: "$primary500",
        bgColorHover: "$primary600",
      }),
    },
    {
      variant: "solid",
      colorScheme: "neutral",
      css: createSolidCompoundVariant({
        color: "$white",
        bgColor: "$neutral500",
        bgColorHover: "$neutral600",
      }),
    },
    {
      variant: "solid",
      colorScheme: "success",
      css: createSolidCompoundVariant({
        color: "$white",
        bgColor: "$success500",
        bgColorHover: "$success600",
      }),
    },
    {
      variant: "solid",
      colorScheme: "info",
      css: createSolidCompoundVariant({
        color: "$white",
        bgColor: "$info500",
        bgColorHover: "$info600",
      }),
    },
    {
      variant: "solid",
      colorScheme: "warning",
      css: createSolidCompoundVariant({
        color: "$white",
        bgColor: "$warning500",
        bgColorHover: "$warning600",
      }),
    },
    {
      variant: "solid",
      colorScheme: "danger",
      css: createSolidCompoundVariant({
        color: "$white",
        bgColor: "$danger500",
        bgColorHover: "$danger600",
      }),
    },
    /**
     * Variant solid - dark mode
     ******************************/
    {
      variant: "solid",
      colorScheme: "primary",
      darkMode: true,
      css: createSolidCompoundVariant({
        color: "$whiteAlpha900",
        bgColor: "$primary700",
        bgColorHover: "$primary600",
      }),
    },
    {
      variant: "solid",
      colorScheme: "neutral",
      darkMode: true,
      css: createSolidCompoundVariant({
        color: "$whiteAlpha900",
        bgColor: "$neutral700",
        bgColorHover: "$neutral600",
      }),
    },
    {
      variant: "solid",
      colorScheme: "success",
      darkMode: true,
      css: createSolidCompoundVariant({
        color: "$whiteAlpha900",
        bgColor: "$success700",
        bgColorHover: "$success600",
      }),
    },
    {
      variant: "solid",
      colorScheme: "info",
      darkMode: true,
      css: createSolidCompoundVariant({
        color: "$whiteAlpha900",
        bgColor: "$info700",
        bgColorHover: "$info600",
      }),
    },
    {
      variant: "solid",
      colorScheme: "warning",
      darkMode: true,
      css: createSolidCompoundVariant({
        color: "$whiteAlpha900",
        bgColor: "$warning700",
        bgColorHover: "$warning600",
      }),
    },
    {
      variant: "solid",
      colorScheme: "danger",
      darkMode: true,
      css: createSolidCompoundVariant({
        color: "$whiteAlpha900",
        bgColor: "$danger700",
        bgColorHover: "$danger600",
      }),
    },
    /**
     * Variant subtle - light mode
     ******************************/
    {
      variant: "subtle",
      colorScheme: "primary",
      css: createSubtleCompoundVariant({
        color: "$primary600",
        bgColor: "$primary50",
        bgColorHover: "$primary100",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "neutral",
      css: createSubtleCompoundVariant({
        color: "$neutral600",
        bgColor: "$neutral100",
        bgColorHover: "$neutral200",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "success",
      css: createSubtleCompoundVariant({
        color: "$success600",
        bgColor: "$success50",
        bgColorHover: "$success100",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "info",
      css: createSubtleCompoundVariant({
        color: "$info600",
        bgColor: "$info50",
        bgColorHover: "$info100",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "warning",
      css: createSubtleCompoundVariant({
        color: "$warning600",
        bgColor: "$warning50",
        bgColorHover: "$warning100",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "danger",
      css: createSubtleCompoundVariant({
        color: "$danger600",
        bgColor: "$danger50",
        bgColorHover: "$danger100",
      }),
    },
    /**
     * Variant subtle - dark mode
     ******************************/
    {
      variant: "subtle",
      colorScheme: "primary",
      darkMode: true,
      css: createSubtleCompoundVariant({
        color: "$primary200",
        bgColor: "$primary900",
        bgColorHover: "$primary800",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "neutral",
      darkMode: true,
      css: createSubtleCompoundVariant({
        color: "$neutral300",
        bgColor: "$neutral800",
        bgColorHover: "$neutral700",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "success",
      darkMode: true,
      css: createSubtleCompoundVariant({
        color: "$success200",
        bgColor: "$success900",
        bgColorHover: "$success800",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "info",
      darkMode: true,
      css: createSubtleCompoundVariant({
        color: "$info200",
        bgColor: "$info900",
        bgColorHover: "$info800",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "warning",
      darkMode: true,
      css: createSubtleCompoundVariant({
        color: "$warning200",
        bgColor: "$warning900",
        bgColorHover: "$warning800",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "danger",
      darkMode: true,
      css: createSubtleCompoundVariant({
        color: "$danger200",
        bgColor: "$danger900",
        bgColorHover: "$danger800",
      }),
    },
    /**
     * Variant outline - light mode
     ******************************/
    {
      variant: "outline",
      colorScheme: "primary",
      css: createOutlineCompoundVariant({ color: "$primary600", bgColorHover: "$primary50" }),
    },
    {
      variant: "outline",
      colorScheme: "neutral",
      css: createOutlineCompoundVariant({ color: "$neutral600", bgColorHover: "$neutral100" }),
    },
    {
      variant: "outline",
      colorScheme: "success",
      css: createOutlineCompoundVariant({ color: "$success600", bgColorHover: "$success50" }),
    },
    {
      variant: "outline",
      colorScheme: "info",
      css: createOutlineCompoundVariant({ color: "$info600", bgColorHover: "$info50" }),
    },
    {
      variant: "outline",
      colorScheme: "warning",
      css: createOutlineCompoundVariant({ color: "$warning600", bgColorHover: "$warning50" }),
    },
    {
      variant: "outline",
      colorScheme: "danger",
      css: createOutlineCompoundVariant({ color: "$danger600", bgColorHover: "$danger50" }),
    },
    /**
     * Variant outline - dark mode
     ******************************/
    {
      variant: "outline",
      colorScheme: "primary",
      darkMode: true,
      css: createOutlineCompoundVariant({ color: "$primary700", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "outline",
      colorScheme: "neutral",
      darkMode: true,
      css: createOutlineCompoundVariant({ color: "$neutral500", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "outline",
      colorScheme: "success",
      darkMode: true,
      css: createOutlineCompoundVariant({ color: "$success700", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "outline",
      colorScheme: "info",
      darkMode: true,
      css: createOutlineCompoundVariant({ color: "$info700", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "outline",
      colorScheme: "warning",
      darkMode: true,
      css: createOutlineCompoundVariant({ color: "$warning700", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "outline",
      colorScheme: "danger",
      darkMode: true,
      css: createOutlineCompoundVariant({ color: "$danger700", bgColorHover: "$whiteAlpha50" }),
    },
    /**
     * Variant dashed - light mode
     ******************************/
    {
      variant: "dashed",
      colorScheme: "primary",
      css: createOutlineCompoundVariant({ color: "$primary600", bgColorHover: "$primary50" }),
    },
    {
      variant: "dashed",
      colorScheme: "neutral",
      css: createOutlineCompoundVariant({ color: "$neutral600", bgColorHover: "$neutral100" }),
    },
    {
      variant: "dashed",
      colorScheme: "success",
      css: createOutlineCompoundVariant({ color: "$success600", bgColorHover: "$success50" }),
    },
    {
      variant: "dashed",
      colorScheme: "info",
      css: createOutlineCompoundVariant({ color: "$info600", bgColorHover: "$info50" }),
    },
    {
      variant: "dashed",
      colorScheme: "warning",
      css: createOutlineCompoundVariant({ color: "$warning600", bgColorHover: "$warning50" }),
    },
    {
      variant: "dashed",
      colorScheme: "danger",
      css: createOutlineCompoundVariant({ color: "$danger600", bgColorHover: "$danger50" }),
    },
    /**
     * Variant dashed - dark mode
     ******************************/
    {
      variant: "dashed",
      colorScheme: "primary",
      darkMode: true,
      css: createOutlineCompoundVariant({ color: "$primary700", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "dashed",
      colorScheme: "neutral",
      darkMode: true,
      css: createOutlineCompoundVariant({ color: "$neutral500", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "dashed",
      colorScheme: "success",
      darkMode: true,
      css: createOutlineCompoundVariant({ color: "$success700", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "dashed",
      colorScheme: "info",
      darkMode: true,
      css: createOutlineCompoundVariant({ color: "$info700", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "dashed",
      colorScheme: "warning",
      darkMode: true,
      css: createOutlineCompoundVariant({ color: "$warning700", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "dashed",
      colorScheme: "danger",
      darkMode: true,
      css: createOutlineCompoundVariant({ color: "$danger700", bgColorHover: "$whiteAlpha50" }),
    },
    /**
     * Variant ghost - light mode
     ******************************/
    {
      variant: "ghost",
      colorScheme: "primary",
      css: createGhostCompoundVariant({ color: "$primary600", bgColorHover: "$primary50" }),
    },
    {
      variant: "ghost",
      colorScheme: "neutral",
      css: createGhostCompoundVariant({ color: "$neutral600", bgColorHover: "$neutral100" }),
    },
    {
      variant: "ghost",
      colorScheme: "success",
      css: createGhostCompoundVariant({ color: "$success600", bgColorHover: "$success50" }),
    },
    {
      variant: "ghost",
      colorScheme: "info",
      css: createGhostCompoundVariant({ color: "$info600", bgColorHover: "$info50" }),
    },
    {
      variant: "ghost",
      colorScheme: "warning",
      css: createGhostCompoundVariant({ color: "$warning600", bgColorHover: "$warning50" }),
    },
    {
      variant: "ghost",
      colorScheme: "danger",
      css: createGhostCompoundVariant({ color: "$danger600", bgColorHover: "$danger50" }),
    },
    /**
     * Variant ghost - dark mode
     ******************************/
    {
      variant: "ghost",
      colorScheme: "primary",
      darkMode: true,
      css: createGhostCompoundVariant({ color: "$primary700", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "ghost",
      colorScheme: "neutral",
      darkMode: true,
      css: createGhostCompoundVariant({ color: "$neutral500", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "ghost",
      colorScheme: "success",
      darkMode: true,
      css: createGhostCompoundVariant({ color: "$success700", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "ghost",
      colorScheme: "info",
      darkMode: true,
      css: createGhostCompoundVariant({ color: "$info700", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "ghost",
      colorScheme: "warning",
      darkMode: true,
      css: createGhostCompoundVariant({ color: "$warning700", bgColorHover: "$whiteAlpha50" }),
    },
    {
      variant: "ghost",
      colorScheme: "danger",
      darkMode: true,
      css: createGhostCompoundVariant({ color: "$danger700", bgColorHover: "$whiteAlpha50" }),
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
