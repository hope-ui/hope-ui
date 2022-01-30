import { VariantProps } from "@stitches/core";

import { css } from "@/theme/stitches.config";
import { SystemStyleObject } from "@/theme/types";

import { boxStyles } from "../Box/Box.styles";

/* -------------------------------------------------------------------------------------------------
 * TagCloseButton
 * -----------------------------------------------------------------------------------------------*/

export const tagCloseButtonIconStyles = css();

export const tagCloseButtonStyles = css(boxStyles, {
  appearance: "none",
  position: "relative",

  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",

  outline: "none",
  border: "1px solid transparent",

  backgroundColor: "transparent",

  padding: "0",

  lineHeight: "$none",
  textDecoration: "none",
  color: "inherit",

  cursor: "pointer",
  userSelect: "none",
  transition: "color 250ms, background-color 250ms",

  "&:not(:disabled):active": {
    transform: "translateY(1px)",
  },

  "&:focus-visible": {
    outline: "2px solid #2563eb",
    outlineOffset: "0",
  },

  "&:disabled": {
    border: "1px solid transparent",
    backgroundColor: "transparent",
    color: "$neutral300",
    cursor: "not-allowed",
  },
});

export type TagCloseButtonVariants = VariantProps<typeof tagCloseButtonStyles>;

/* -------------------------------------------------------------------------------------------------
 * Tag
 * -----------------------------------------------------------------------------------------------*/

interface TagSizeVariantConfig {
  height: string;
  paddingX: string;
  fontSize: string;
  iconSize: string;
  closeButtonSize: string;
  closeButtonIconSize: string;
  spacing: string;
}

function createTagSizeVariant(config: TagSizeVariantConfig): SystemStyleObject {
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

    [`& .${tagCloseButtonStyles}`]: {
      boxSize: config.closeButtonSize,
    },

    [`& .${tagCloseButtonStyles} .${tagCloseButtonIconStyles}`]: {
      boxSize: config.closeButtonIconSize,
    },
  };
}

interface TagFilledCompoundVariantConfig {
  bgColor: string;
  closeButtonBgColorHover: string;
}

function createTagFilledCompoundVariant(config: TagFilledCompoundVariantConfig): SystemStyleObject {
  return {
    backgroundColor: config.bgColor,
    [`& .${tagCloseButtonStyles}:not(:disabled):hover`]: {
      backgroundColor: config.closeButtonBgColorHover,
    },
  };
}

interface TagLightCompoundVariantConfig {
  bgColor: string;
  color: string;
  closeButtonBgColorHover: string;
}

function createTagLightCompoundVariant(config: TagLightCompoundVariantConfig): SystemStyleObject {
  return {
    backgroundColor: config.bgColor,
    color: config.color,

    [`& .${tagCloseButtonStyles}:not(:disabled):hover`]: {
      backgroundColor: config.closeButtonBgColorHover,
    },
  };
}

interface TagOutlineCompoundVariantConfig {
  color: string;
  closeButtonBgColorHover: string;
}

function createTagOutlineCompoundVariant(
  config: TagOutlineCompoundVariantConfig
): SystemStyleObject {
  return {
    borderColor: config.color,
    color: config.color,

    [`& .${tagCloseButtonStyles}:not(:disabled):hover`]: {
      backgroundColor: config.closeButtonBgColorHover,
    },
  };
}

function createTagDotAndSizeCompoundVariant(size: string): SystemStyleObject {
  return {
    "&::before,  &::after": {
      boxSize: size,
    },

    "&::before": {
      marginRight: size,
    },

    "&::after": {
      marginLeft: size,
    },
  };
}

export const tagStyles = css(boxStyles, {
  appearance: "none",
  position: "relative",

  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",

  fontWeight: "$semibold",
  lineHeight: "$none",
  textDecoration: "none",

  variants: {
    variant: {
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
      dot: {
        border: "1px solid $neutral300",
        backgroundColor: "transparent",
        color: "$neutral600",

        "&::before,  &::after": {
          content: "''",
          borderRadius: "$full",
        },

        "&::before": {
          display: "block",
        },

        "&::after": {
          display: "none",
        },

        [`& .${tagCloseButtonStyles}:not(:disabled):hover`]: {
          backgroundColor: "$neutral200",
        },
      },
    },
    colorScheme: {
      primary: {},
      dark: {},
      neutral: {},
      success: {},
      info: {},
      warning: {},
      danger: {},
    },
    size: {
      sm: createTagSizeVariant({
        height: "$5",
        paddingX: "$2",
        fontSize: "$xs",
        iconSize: "$4",
        closeButtonSize: "$4",
        closeButtonIconSize: "$3_5",
        spacing: "$1",
      }),
      md: createTagSizeVariant({
        height: "$6",
        paddingX: "$2",
        fontSize: "$sm",
        iconSize: "$5",
        closeButtonSize: "$5",
        closeButtonIconSize: "$4",
        spacing: "$1_5",
      }),
      lg: createTagSizeVariant({
        height: "$8",
        paddingX: "$3",
        fontSize: "$base",
        iconSize: "$7",
        closeButtonSize: "$7",
        closeButtonIconSize: "$5",
        spacing: "$2",
      }),
    },
    withLeftSection: { true: {} },
    withRightSection: { true: {} },
  },
  compoundVariants: [
    /**
     * Variant filled + color
     ******************************/
    {
      variant: "filled",
      colorScheme: "primary",
      css: createTagFilledCompoundVariant({
        bgColor: "$primary500",
        closeButtonBgColorHover: "$primary600",
      }),
    },
    {
      variant: "filled",
      colorScheme: "dark",
      css: createTagFilledCompoundVariant({
        bgColor: "$dark500",
        closeButtonBgColorHover: "$dark300",
      }),
    },
    {
      variant: "filled",
      colorScheme: "neutral",
      css: createTagFilledCompoundVariant({
        bgColor: "$neutral500",
        closeButtonBgColorHover: "$neutral600",
      }),
    },
    {
      variant: "filled",
      colorScheme: "success",
      css: createTagFilledCompoundVariant({
        bgColor: "$success500",
        closeButtonBgColorHover: "$success600",
      }),
    },
    {
      variant: "filled",
      colorScheme: "info",
      css: createTagFilledCompoundVariant({
        bgColor: "$info500",
        closeButtonBgColorHover: "$info600",
      }),
    },
    {
      variant: "filled",
      colorScheme: "warning",
      css: createTagFilledCompoundVariant({
        bgColor: "$warning500",
        closeButtonBgColorHover: "$warning600",
      }),
    },
    {
      variant: "filled",
      colorScheme: "danger",
      css: createTagFilledCompoundVariant({
        bgColor: "$danger500",
        closeButtonBgColorHover: "$danger600",
      }),
    },
    /**
     * Variant light + color
     ******************************/
    {
      variant: "light",
      colorScheme: "primary",
      css: createTagLightCompoundVariant({
        bgColor: "$primary50",
        color: "$primary600",
        closeButtonBgColorHover: "$primary100",
      }),
    },
    {
      variant: "light",
      colorScheme: "dark",
      css: createTagLightCompoundVariant({
        bgColor: "$dark50",
        color: "$dark800",
        closeButtonBgColorHover: "$dark100",
      }),
    },
    {
      variant: "light",
      colorScheme: "neutral",
      css: createTagLightCompoundVariant({
        bgColor: "$neutral100",
        color: "$neutral600",
        closeButtonBgColorHover: "$neutral200",
      }),
    },
    {
      variant: "light",
      colorScheme: "success",
      css: createTagLightCompoundVariant({
        bgColor: "$success50",
        color: "$success600",
        closeButtonBgColorHover: "$success100",
      }),
    },
    {
      variant: "light",
      colorScheme: "info",
      css: createTagLightCompoundVariant({
        bgColor: "$info50",
        color: "$info600",
        closeButtonBgColorHover: "$info100",
      }),
    },
    {
      variant: "light",
      colorScheme: "warning",
      css: createTagLightCompoundVariant({
        bgColor: "$warning50",
        color: "$warning600",
        closeButtonBgColorHover: "$warning100",
      }),
    },
    {
      variant: "light",
      colorScheme: "danger",
      css: createTagLightCompoundVariant({
        bgColor: "$danger50",
        color: "$danger600",
        closeButtonBgColorHover: "$danger100",
      }),
    },
    /**
     * Variant outline + color
     ******************************/
    {
      variant: "outline",
      colorScheme: "primary",
      css: createTagOutlineCompoundVariant({
        color: "$primary600",
        closeButtonBgColorHover: "$primary100",
      }),
    },
    {
      variant: "outline",
      colorScheme: "dark",
      css: createTagOutlineCompoundVariant({
        color: "$dark600",
        closeButtonBgColorHover: "$dark50",
      }),
    },
    {
      variant: "outline",
      colorScheme: "neutral",
      css: createTagOutlineCompoundVariant({
        color: "$neutral600",
        closeButtonBgColorHover: "$neutral200",
      }),
    },
    {
      variant: "outline",
      colorScheme: "success",
      css: createTagOutlineCompoundVariant({
        color: "$success600",
        closeButtonBgColorHover: "$success100",
      }),
    },
    {
      variant: "outline",
      colorScheme: "info",
      css: createTagOutlineCompoundVariant({
        color: "$info600",
        closeButtonBgColorHover: "$info100",
      }),
    },
    {
      variant: "outline",
      colorScheme: "warning",
      css: createTagOutlineCompoundVariant({
        color: "$warning600",
        closeButtonBgColorHover: "$warning100",
      }),
    },
    {
      variant: "outline",
      colorScheme: "danger",
      css: createTagOutlineCompoundVariant({
        color: "$danger600",
        closeButtonBgColorHover: "$danger100",
      }),
    },
    /**
     * Variant dot + color
     ******************************/
    {
      variant: "dot",
      colorScheme: "primary",
      css: {
        "&::before, &::after": {
          backgroundColor: "$primary500",
        },
      },
    },
    {
      variant: "dot",
      colorScheme: "dark",
      css: {
        "&::before, &::after": {
          backgroundColor: "$dark500",
        },
      },
    },
    {
      variant: "dot",
      colorScheme: "neutral",
      css: {
        "&::before, &::after": {
          backgroundColor: "$neutral500",
        },
      },
    },
    {
      variant: "dot",
      colorScheme: "success",
      css: {
        "&::before, &::after": {
          backgroundColor: "$success500",
        },
      },
    },
    {
      variant: "dot",
      colorScheme: "info",
      css: {
        "&::before, &::after": {
          backgroundColor: "$info500",
        },
      },
    },
    {
      variant: "dot",
      colorScheme: "warning",
      css: {
        "&::before, &::after": {
          backgroundColor: "$warning500",
        },
      },
    },
    {
      variant: "dot",
      colorScheme: "danger",
      css: {
        "&::before, &::after": {
          backgroundColor: "$danger500",
        },
      },
    },
    /**
     * Variant dot + size
     ******************************/
    {
      variant: "dot",
      size: "sm",
      css: createTagDotAndSizeCompoundVariant("$1_5"),
    },
    {
      variant: "dot",
      size: "md",
      css: createTagDotAndSizeCompoundVariant("$2"),
    },
    {
      variant: "dot",
      size: "lg",
      css: createTagDotAndSizeCompoundVariant("$2_5"),
    },
    /**
     * Variant dot + side sections
     ******************************/
    {
      variant: "dot",
      withLeftSection: "true",
      css: {
        "&::before": {
          display: "none",
        },

        "&::after": {
          display: "block",
        },
      },
    },
    {
      variant: "dot",
      withLeftSection: "true",
      withRightSection: "true",
      css: {
        "&::before, &::after": {
          display: "none",
        },
      },
    },
    /**
     * Variant left section + size
     ******************************/
    {
      withLeftSection: "true",
      size: "sm",
      css: { paddingLeft: "$0_5" },
    },
    {
      size: "md",
      withLeftSection: "true",
      css: { paddingLeft: "$0_5" },
    },
    {
      withLeftSection: "true",
      size: "lg",
      css: { paddingLeft: "$0_5" },
    },
    /**
     * Variant right section + size
     ******************************/
    {
      withRightSection: "true",
      size: "sm",
      css: { paddingRight: "$0_5" },
    },
    {
      size: "md",
      withRightSection: "true",
      css: { paddingRight: "$0_5" },
    },
    {
      withRightSection: "true",
      size: "lg",
      css: { paddingRight: "$0_5" },
    },
  ],
});

export type TagVariants = VariantProps<typeof tagStyles>;
