import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";
import { SystemStyleObject } from "@/styled-system/types";

/* -------------------------------------------------------------------------------------------------
 * TagRightIcon & TagLeftIcon
 * -----------------------------------------------------------------------------------------------*/

export const tagRightIconStyles = css({
  marginInlineStart: "$2",
});

export const tagLeftIconStyles = css({
  marginInlineEnd: "$2",
});

/* -------------------------------------------------------------------------------------------------
 * TagLabel
 * -----------------------------------------------------------------------------------------------*/

export const tagLabelStyles = css({
  noOfLines: 1,
});

/* -------------------------------------------------------------------------------------------------
 * TagCloseButton
 * -----------------------------------------------------------------------------------------------*/

export const tagCloseButtonStyles = css({
  appearance: "none",
  position: "relative",

  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",

  marginInlineStart: "$1",
  marginInlineEnd: "-0.25rem",

  outline: "none",
  border: "1px solid transparent",
  borderRadius: "$full",

  backgroundColor: "transparent",

  padding: "0",

  //fontSize: "1em",
  lineHeight: "$none",
  textDecoration: "none",
  color: "inherit",

  cursor: "pointer",
  userSelect: "none",
  transition: "color 250ms, background-color 250ms, opacity 250ms, box-shadow 250ms",

  "&:focus": {
    outline: "none",
    boxShadow: "0 0 0 3px $colors$focusRing",
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
  lineHeight: string;
  closeButtonSize: string;
}

function createTagSizeVariant(config: TagSizeVariantConfig): SystemStyleObject {
  return {
    height: config.height,
    py: 0,
    px: config.paddingX,
    fontSize: config.fontSize,
    lineHeight: config.lineHeight,

    [`& .${tagCloseButtonStyles}`]: {
      boxSize: config.closeButtonSize,
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

function createTagOutlineCompoundVariant(config: TagOutlineCompoundVariantConfig): SystemStyleObject {
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

  fontWeight: "$medium",
  lineHeight: "$none",
  textDecoration: "none",

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
        lineHeight: "$4",
        closeButtonSize: "$4",
      }),
      md: createTagSizeVariant({
        height: "$6",
        paddingX: "$2",
        fontSize: "$sm",
        lineHeight: "$5",
        closeButtonSize: "$5",
      }),
      lg: createTagSizeVariant({
        height: "$8",
        paddingX: "$3",
        fontSize: "$base",
        lineHeight: "$6",
        closeButtonSize: "$6",
      }),
    },
    dotPosition: {
      left: {},
      right: {},
    },
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
        bgColor: "$primary4",
        closeButtonBgColorHover: "$primary5",
        closeButtonBgColorActive: "$primary6",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "neutral",
      css: createTagSubtleCompoundVariant({
        color: "$neutral12",
        bgColor: "$neutral4",
        closeButtonBgColorHover: "$neutral5",
        closeButtonBgColorActive: "$neutral6",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "success",
      css: createTagSubtleCompoundVariant({
        color: "$success11",
        bgColor: "$success4",
        closeButtonBgColorHover: "$success5",
        closeButtonBgColorActive: "$success6",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "info",
      css: createTagSubtleCompoundVariant({
        color: "$info11",
        bgColor: "$info4",
        closeButtonBgColorHover: "$info5",
        closeButtonBgColorActive: "$info6",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "warning",
      css: createTagSubtleCompoundVariant({
        color: "$warning11",
        bgColor: "$warning4",
        closeButtonBgColorHover: "$warning5",
        closeButtonBgColorActive: "$warning6",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "danger",
      css: createTagSubtleCompoundVariant({
        color: "$danger11",
        bgColor: "$danger4",
        closeButtonBgColorHover: "$danger5",
        closeButtonBgColorActive: "$danger6",
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
     * Variant - dot + dot position
     * -----------------------------------------------------------------------------------------------*/

    {
      variant: "dot",
      dotPosition: "right",
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
      dotPosition: "left",
      css: {
        "&::before": {
          display: "block",
        },

        "&::after": {
          display: "none",
        },
      },
    },
  ],
});

export type TagVariants = VariantProps<typeof tagStyles>;
