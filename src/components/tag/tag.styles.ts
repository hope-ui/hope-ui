import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";
import { SystemStyleObject } from "@/styled-system/types";

/* -------------------------------------------------------------------------------------------------
 * TagCloseButton
 * -----------------------------------------------------------------------------------------------*/

export const tagCloseButtonIconStyles = css();

export const tagCloseButtonStyles = css({
  appearance: "none",
  position: "relative",

  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",

  outline: "none",
  border: "1px solid transparent",
  borderRadius: "$full",

  backgroundColor: "transparent",

  padding: "0",

  lineHeight: "$none",
  textDecoration: "none",
  color: "inherit",

  cursor: "pointer",
  userSelect: "none",
  transition: "color 250ms, background-color 250ms, opacity 250ms",

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
    color: "$neutral3",
    cursor: "not-allowed",
  },
});

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

interface TagSolidCompoundVariantConfig {
  color: string;
  bgColor: string;
  closeButtonBgColorHover: string;
}

function createTagSolidCompoundVariant(config: TagSolidCompoundVariantConfig): SystemStyleObject {
  return {
    backgroundColor: config.bgColor,
    color: config.color,

    [`& .${tagCloseButtonStyles}:not(:disabled):hover`]: {
      backgroundColor: config.closeButtonBgColorHover,
    },
  };
}

interface TagSubtleCompoundVariantConfig {
  color: string;
  bgColor: string;
  closeButtonBgColorHover: string;
  closeButtonBgColorActive: string;
}

function createTagSubtleCompoundVariant(config: TagSubtleCompoundVariantConfig): SystemStyleObject {
  return {
    backgroundColor: config.bgColor,
    color: config.color,

    [`& .${tagCloseButtonStyles}:not(:disabled):hover`]: {
      backgroundColor: config.closeButtonBgColorHover,
    },

    [`& .${tagCloseButtonStyles}:not(:disabled):active`]: {
      backgroundColor: config.closeButtonBgColorActive,
    },
  };
}

interface TagOutlineCompoundVariantConfig {
  color: string;
  borderColor: string;
  closeButtonBgColorHover: string;
  closeButtonBgColorActive: string;
}

function createTagOutlineCompoundVariant(
  config: TagOutlineCompoundVariantConfig
): SystemStyleObject {
  return {
    borderColor: config.borderColor,
    color: config.color,

    [`& .${tagCloseButtonStyles}:not(:disabled):hover`]: {
      backgroundColor: config.closeButtonBgColorHover,
    },

    [`& .${tagCloseButtonStyles}:not(:disabled):active`]: {
      backgroundColor: config.closeButtonBgColorActive,
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

export const tagStyles = css({
  appearance: "none",
  position: "relative",

  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",

  borderRadius: "$full",

  fontWeight: "$semibold",
  lineHeight: "$none",
  textDecoration: "none",

  [`& .${tagCloseButtonStyles}`]: {
    opacity: "0.7",
  },

  [`& .${tagCloseButtonStyles}:not(:disabled):hover, 
    & .${tagCloseButtonStyles}:not(:disabled):active`]: {
    opacity: 1,
  },

  variants: {
    variant: {
      solid: {
        border: "1px solid transparent",
        color: "white",
      },
      subtle: {
        border: "1px solid transparent",
      },
      outline: {
        borderStyle: "solid",
        borderWidth: "1px",
        backgroundColor: "transparent",
      },
      dot: {
        border: "1px solid $neutral7",
        backgroundColor: "transparent",
        color: "$neutral12",

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
          backgroundColor: "$neutral4",
        },

        [`& .${tagCloseButtonStyles}:not(:disabled):active`]: {
          backgroundColor: "$neutral5",
        },
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
    /* -------------------------------------------------------------------------------------------------
     * Variant - solid + color
     * -----------------------------------------------------------------------------------------------*/

    {
      variant: "solid",
      colorScheme: "primary",
      css: createTagSolidCompoundVariant({
        color: "white",
        bgColor: "$primary9",
        closeButtonBgColorHover: "$primary10",
      }),
    },
    {
      variant: "solid",
      colorScheme: "neutral",
      css: createTagSolidCompoundVariant({
        color: "white",
        bgColor: "$neutral9",
        closeButtonBgColorHover: "$neutral10",
      }),
    },
    {
      variant: "solid",
      colorScheme: "success",
      css: createTagSolidCompoundVariant({
        color: "white",
        bgColor: "$success9",
        closeButtonBgColorHover: "$success10",
      }),
    },
    {
      variant: "solid",
      colorScheme: "info",
      css: createTagSolidCompoundVariant({
        color: "white",
        bgColor: "$info9",
        closeButtonBgColorHover: "$info10",
      }),
    },
    {
      variant: "solid",
      colorScheme: "warning",
      css: createTagSolidCompoundVariant({
        color: "$blackAlpha12",
        bgColor: "$warning9",
        closeButtonBgColorHover: "$warning10",
      }),
    },
    {
      variant: "solid",
      colorScheme: "danger",
      css: createTagSolidCompoundVariant({
        color: "white",
        bgColor: "$danger9",
        closeButtonBgColorHover: "$danger10",
      }),
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - subtle + color
     * -----------------------------------------------------------------------------------------------*/

    {
      variant: "subtle",
      colorScheme: "primary",
      css: createTagSubtleCompoundVariant({
        color: "$primary11",
        bgColor: "$primary3",
        closeButtonBgColorHover: "$primary4",
        closeButtonBgColorActive: "$primary5",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "neutral",
      css: createTagSubtleCompoundVariant({
        color: "$neutral12",
        bgColor: "$neutral3",
        closeButtonBgColorHover: "$neutral4",
        closeButtonBgColorActive: "$neutral5",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "success",
      css: createTagSubtleCompoundVariant({
        color: "$success11",
        bgColor: "$success3",
        closeButtonBgColorHover: "$success4",
        closeButtonBgColorActive: "$success5",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "info",
      css: createTagSubtleCompoundVariant({
        color: "$info11",
        bgColor: "$info3",
        closeButtonBgColorHover: "$info4",
        closeButtonBgColorActive: "$info5",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "warning",
      css: createTagSubtleCompoundVariant({
        color: "$warning11",
        bgColor: "$warning3",
        closeButtonBgColorHover: "$warning4",
        closeButtonBgColorActive: "$warning5",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "danger",
      css: createTagSubtleCompoundVariant({
        color: "$danger11",
        bgColor: "$danger3",
        closeButtonBgColorHover: "$danger4",
        closeButtonBgColorActive: "$danger5",
      }),
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - outline + color
     * -----------------------------------------------------------------------------------------------*/

    {
      variant: "outline",
      colorScheme: "primary",
      css: createTagOutlineCompoundVariant({
        color: "$primary11",
        borderColor: "$primary7",
        closeButtonBgColorHover: "$primary4",
        closeButtonBgColorActive: "$primary5",
      }),
    },
    {
      variant: "outline",
      colorScheme: "neutral",
      css: createTagOutlineCompoundVariant({
        color: "$neutral12",
        borderColor: "$neutral7",
        closeButtonBgColorHover: "$neutral4",
        closeButtonBgColorActive: "$neutral5",
      }),
    },
    {
      variant: "outline",
      colorScheme: "success",
      css: createTagOutlineCompoundVariant({
        color: "$success11",
        borderColor: "$success7",
        closeButtonBgColorHover: "$success4",
        closeButtonBgColorActive: "$success5",
      }),
    },
    {
      variant: "outline",
      colorScheme: "info",
      css: createTagOutlineCompoundVariant({
        color: "$info11",
        borderColor: "$info7",
        closeButtonBgColorHover: "$info4",
        closeButtonBgColorActive: "$info5",
      }),
    },
    {
      variant: "outline",
      colorScheme: "warning",
      css: createTagOutlineCompoundVariant({
        color: "$warning11",
        borderColor: "$warning7",
        closeButtonBgColorHover: "$warning4",
        closeButtonBgColorActive: "$warning5",
      }),
    },
    {
      variant: "outline",
      colorScheme: "danger",
      css: createTagOutlineCompoundVariant({
        color: "$danger11",
        borderColor: "$danger7",
        closeButtonBgColorHover: "$danger4",
        closeButtonBgColorActive: "$danger5",
      }),
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - dot + color
     * -----------------------------------------------------------------------------------------------*/

    {
      variant: "dot",
      colorScheme: "primary",
      css: {
        "&::before, &::after": {
          backgroundColor: "$primary9",
        },
      },
    },
    {
      variant: "dot",
      colorScheme: "neutral",
      css: {
        "&::before, &::after": {
          backgroundColor: "$neutral9",
        },
      },
    },
    {
      variant: "dot",
      colorScheme: "success",
      css: {
        "&::before, &::after": {
          backgroundColor: "$success9",
        },
      },
    },
    {
      variant: "dot",
      colorScheme: "info",
      css: {
        "&::before, &::after": {
          backgroundColor: "$info9",
        },
      },
    },
    {
      variant: "dot",
      colorScheme: "warning",
      css: {
        "&::before, &::after": {
          backgroundColor: "$warning9",
        },
      },
    },
    {
      variant: "dot",
      colorScheme: "danger",
      css: {
        "&::before, &::after": {
          backgroundColor: "$danger9",
        },
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - dot + size
     * -----------------------------------------------------------------------------------------------*/

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

    /* -------------------------------------------------------------------------------------------------
     * Variant - dot + side sections
     * -----------------------------------------------------------------------------------------------*/

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

    /* -------------------------------------------------------------------------------------------------
     * Variant - left section + size
     * -----------------------------------------------------------------------------------------------*/

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

    /* -------------------------------------------------------------------------------------------------
     * Variant - right section + size
     * -----------------------------------------------------------------------------------------------*/

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
