import { VariantProps } from "@stitches/core";

import { spin } from "../../styled-system/keyframes";
import { css } from "../../styled-system/stitches.config";
import { SystemStyleObject } from "../../styled-system/types";

export const hopeIconButtonClass = "hope-icon-button";

/* -------------------------------------------------------------------------------------------------
 * Button - icon
 * -----------------------------------------------------------------------------------------------*/

export const buttonIconStyles = css({
  display: "inline-flex",
  alignSelf: "center",
  flexShrink: 0,
});

/* -------------------------------------------------------------------------------------------------
 * Button - loader
 * -----------------------------------------------------------------------------------------------*/

export const buttonLoaderStyles = css({
  position: "absolute",

  display: "flex",
  alignItems: "center",
  flexShrink: 0,

  fontSize: "1em",
  lineHeight: "$normal",

  variants: {
    withLoadingText: {
      true: {
        position: "relative",
      },
    },
  },
});

/* -------------------------------------------------------------------------------------------------
 * Button - default icon spinner
 * -----------------------------------------------------------------------------------------------*/

export const buttonIconSpinnerStyles = css({
  fontSize: "1.3em",
  animation: `1s linear infinite ${spin}`,
});

/* -------------------------------------------------------------------------------------------------
 * Button - Size
 * -----------------------------------------------------------------------------------------------*/

interface SizeVariantConfig {
  height: string;
  paddingX: string;
  fontSize: string;
  spacing: string;
}

function createSizeVariant(config: SizeVariantConfig): SystemStyleObject {
  return {
    height: config.height,
    py: 0,
    px: config.paddingX,
    fontSize: config.fontSize,

    [`&.${hopeIconButtonClass}`]: {
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

    [`&.${hopeIconButtonClass}`]: {
      width: config.height,
      padding: "0",
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Button - variant - solid
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
 * Button - variant - subtle
 * -----------------------------------------------------------------------------------------------*/

interface SubtleCompoundVariantConfig {
  color: string;
  bgColor: string;
  bgColorHover: string;
  bgColorActive: string;
}

function createSubtleCompoundVariant(config: SubtleCompoundVariantConfig): SystemStyleObject {
  return {
    backgroundColor: config.bgColor,
    color: config.color,

    "&:not(:disabled):hover": {
      backgroundColor: config.bgColorHover,
    },

    "&:not(:disabled):active": {
      backgroundColor: config.bgColorActive,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Button - variant - outline
 * -----------------------------------------------------------------------------------------------*/

interface OutlineCompoundVariantConfig {
  color: string;
  borderColor: string;
  borderColorHover: string;
  bgColorHover: string;
  bgColorActive: string;
}

function createOutlineCompoundVariant(config: OutlineCompoundVariantConfig): SystemStyleObject {
  return {
    borderColor: config.borderColor,
    color: config.color,

    "&:not(:disabled):hover": {
      borderColor: config.borderColorHover,
      backgroundColor: config.bgColorHover,
    },

    "&:not(:disabled):active": {
      backgroundColor: config.bgColorActive,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Button - variant - ghost
 * -----------------------------------------------------------------------------------------------*/

interface GhostCompoundVariantConfig {
  color: string;
  bgColorHover: string;
  bgColorActive: string;
}

function createGhostCompoundVariant(config: GhostCompoundVariantConfig): SystemStyleObject {
  return {
    color: config.color,

    "&:not(:disabled):hover": {
      backgroundColor: config.bgColorHover,
    },

    "&:not(:disabled):active": {
      backgroundColor: config.bgColorActive,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Button - styles
 * -----------------------------------------------------------------------------------------------*/

export const buttonStyles = css({
  appearance: "none",
  position: "relative",

  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",

  outline: "none",
  borderRadius: "$sm",

  padding: "0",

  fontWeight: "$medium",
  lineHeight: "$none",
  textDecoration: "none",

  cursor: "pointer",
  userSelect: "none",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  //transition: "color 250ms, background-color 250ms",

  // box-shadow transition on button focus f*cked up solid-transition-group of modal and drawer
  transition: "color 250ms, background-color 250ms, box-shadow 250ms",

  "&:focus": {
    outline: "none",
    boxShadow: "$outline",
  },

  "&:disabled": {
    color: "$neutral7",
    cursor: "not-allowed",
  },

  variants: {
    variant: {
      solid: {
        border: "1px solid transparent",

        "&:disabled": {
          backgroundColor: "$neutral3",
        },
      },
      subtle: {
        border: "1px solid transparent",

        "&:disabled": {
          backgroundColor: "$neutral3",
        },
      },
      outline: {
        borderStyle: "solid",
        borderWidth: "1px",
        backgroundColor: "transparent",

        "&:disabled": {
          borderColor: "$neutral3",
        },
      },
      dashed: {
        borderStyle: "dashed",
        borderWidth: "1px",
        backgroundColor: "transparent",

        "&:disabled": {
          borderColor: "$neutral3",
        },
      },
      ghost: {
        border: "1px solid transparent",
        backgroundColor: "transparent",
      },
    },
    colorScheme: {
      primary: {},
      accent: {},
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
        spacing: "$1",
      }),
      sm: createSizeVariant({
        height: "$8",
        paddingX: "$3",
        fontSize: "$sm",
        spacing: "$1_5",
      }),
      md: createSizeVariant({
        height: "$10",
        paddingX: "$4",
        fontSize: "$base",
        spacing: "$1_5",
      }),
      lg: createSizeVariant({
        height: "$12",
        paddingX: "$6",
        fontSize: "$lg",
        spacing: "$2",
      }),
      xl: createSizeVariant({
        height: "$16",
        paddingX: "$10",
        fontSize: "$xl",
        spacing: "$2",
      }),
    },
    compact: {
      true: {},
      false: {},
    },
    fullWidth: {
      true: {
        display: "flex",
        width: "100%",
      },
      false: {
        display: "inline-flex",
        width: "auto",
      },
    },
    loading: {
      true: {
        opacity: "0.75",
        cursor: "default",
        pointerEvents: "none",
      },
      false: {},
    },
  },

  compoundVariants: [
    /* -------------------------------------------------------------------------------------------------
     * Variant - solid
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "solid",
      colorScheme: "primary",
      css: createSolidCompoundVariant({
        color: "white",
        bgColor: "$primary9",
        bgColorHover: "$primary10",
      }),
    },
    {
      variant: "solid",
      colorScheme: "accent",
      css: createSolidCompoundVariant({
        color: "white",
        bgColor: "$accent9",
        bgColorHover: "$accent10",
      }),
    },
    {
      variant: "solid",
      colorScheme: "neutral",
      css: createSolidCompoundVariant({
        color: "white",
        bgColor: "$neutral9",
        bgColorHover: "$neutral10",
      }),
    },
    {
      variant: "solid",
      colorScheme: "success",
      css: createSolidCompoundVariant({
        color: "white",
        bgColor: "$success9",
        bgColorHover: "$success10",
      }),
    },
    {
      variant: "solid",
      colorScheme: "info",
      css: createSolidCompoundVariant({
        color: "white",
        bgColor: "$info9",
        bgColorHover: "$info10",
      }),
    },
    {
      variant: "solid",
      colorScheme: "warning",
      css: createSolidCompoundVariant({
        color: "$blackAlpha12",
        bgColor: "$warning9",
        bgColorHover: "$warning10",
      }),
    },
    {
      variant: "solid",
      colorScheme: "danger",
      css: createSolidCompoundVariant({
        color: "white",
        bgColor: "$danger9",
        bgColorHover: "$danger10",
      }),
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - subtle
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "subtle",
      colorScheme: "primary",
      css: createSubtleCompoundVariant({
        color: "$primary11",
        bgColor: "$primary4",
        bgColorHover: "$primary5",
        bgColorActive: "$primary6",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "accent",
      css: createSubtleCompoundVariant({
        color: "$accent11",
        bgColor: "$accent4",
        bgColorHover: "$accent5",
        bgColorActive: "$accent6",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "neutral",
      css: createSubtleCompoundVariant({
        color: "$neutral12",
        bgColor: "$neutral4",
        bgColorHover: "$neutral5",
        bgColorActive: "$neutral6",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "success",
      css: createSubtleCompoundVariant({
        color: "$success11",
        bgColor: "$success4",
        bgColorHover: "$success5",
        bgColorActive: "$success6",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "info",
      css: createSubtleCompoundVariant({
        color: "$info11",
        bgColor: "$info4",
        bgColorHover: "$info5",
        bgColorActive: "$info6",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "warning",
      css: createSubtleCompoundVariant({
        color: "$warning11",
        bgColor: "$warning4",
        bgColorHover: "$warning5",
        bgColorActive: "$warning6",
      }),
    },
    {
      variant: "subtle",
      colorScheme: "danger",
      css: createSubtleCompoundVariant({
        color: "$danger11",
        bgColor: "$danger4",
        bgColorHover: "$danger5",
        bgColorActive: "$danger6",
      }),
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - outline
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "outline",
      colorScheme: "primary",
      css: createOutlineCompoundVariant({
        color: "$primary11",
        borderColor: "$primary7",
        borderColorHover: "$primary8",
        bgColorHover: "$primary4",
        bgColorActive: "$primary5",
      }),
    },
    {
      variant: "outline",
      colorScheme: "accent",
      css: createOutlineCompoundVariant({
        color: "$accent11",
        borderColor: "$accent7",
        borderColorHover: "$accent8",
        bgColorHover: "$accent4",
        bgColorActive: "$accent5",
      }),
    },
    {
      variant: "outline",
      colorScheme: "neutral",
      css: createOutlineCompoundVariant({
        color: "$neutral12",
        borderColor: "$neutral7",
        borderColorHover: "$neutral8",
        bgColorHover: "$neutral4",
        bgColorActive: "$neutral5",
      }),
    },
    {
      variant: "outline",
      colorScheme: "success",
      css: createOutlineCompoundVariant({
        color: "$success11",
        borderColor: "$success7",
        borderColorHover: "$success8",
        bgColorHover: "$success4",
        bgColorActive: "$success5",
      }),
    },
    {
      variant: "outline",
      colorScheme: "info",
      css: createOutlineCompoundVariant({
        color: "$info11",
        borderColor: "$info7",
        borderColorHover: "$info8",
        bgColorHover: "$info4",
        bgColorActive: "$info5",
      }),
    },
    {
      variant: "outline",
      colorScheme: "warning",
      css: createOutlineCompoundVariant({
        color: "$warning11",
        borderColor: "$warning7",
        borderColorHover: "$warning8",
        bgColorHover: "$warning4",
        bgColorActive: "$warning5",
      }),
    },
    {
      variant: "outline",
      colorScheme: "danger",
      css: createOutlineCompoundVariant({
        color: "$danger11",
        borderColor: "$danger7",
        borderColorHover: "$danger8",
        bgColorHover: "$danger4",
        bgColorActive: "$danger5",
      }),
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - dashed
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "dashed",
      colorScheme: "primary",
      css: createOutlineCompoundVariant({
        color: "$primary11",
        borderColor: "$primary7",
        borderColorHover: "$primary8",
        bgColorHover: "$primary4",
        bgColorActive: "$primary5",
      }),
    },
    {
      variant: "dashed",
      colorScheme: "accent",
      css: createOutlineCompoundVariant({
        color: "$accent11",
        borderColor: "$accent7",
        borderColorHover: "$accent8",
        bgColorHover: "$accent4",
        bgColorActive: "$accent5",
      }),
    },
    {
      variant: "dashed",
      colorScheme: "neutral",
      css: createOutlineCompoundVariant({
        color: "$neutral12",
        borderColor: "$neutral7",
        borderColorHover: "$neutral8",
        bgColorHover: "$neutral4",
        bgColorActive: "$neutral5",
      }),
    },
    {
      variant: "dashed",
      colorScheme: "success",
      css: createOutlineCompoundVariant({
        color: "$success11",
        borderColor: "$success7",
        borderColorHover: "$success8",
        bgColorHover: "$success4",
        bgColorActive: "$success5",
      }),
    },
    {
      variant: "dashed",
      colorScheme: "info",
      css: createOutlineCompoundVariant({
        color: "$info11",
        borderColor: "$info7",
        borderColorHover: "$info8",
        bgColorHover: "$info4",
        bgColorActive: "$info5",
      }),
    },
    {
      variant: "dashed",
      colorScheme: "warning",
      css: createOutlineCompoundVariant({
        color: "$warning11",
        borderColor: "$warning7",
        borderColorHover: "$warning8",
        bgColorHover: "$warning4",
        bgColorActive: "$warning5",
      }),
    },
    {
      variant: "dashed",
      colorScheme: "danger",
      css: createOutlineCompoundVariant({
        color: "$danger11",
        borderColor: "$danger7",
        borderColorHover: "$danger8",
        bgColorHover: "$danger4",
        bgColorActive: "$danger5",
      }),
    },
    /* -------------------------------------------------------------------------------------------------
     * Variant - ghost
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "ghost",
      colorScheme: "primary",
      css: createGhostCompoundVariant({
        color: "$primary11",
        bgColorHover: "$primary4",
        bgColorActive: "$primary5",
      }),
    },
    {
      variant: "ghost",
      colorScheme: "accent",
      css: createGhostCompoundVariant({
        color: "$accent11",
        bgColorHover: "$accent4",
        bgColorActive: "$accent5",
      }),
    },
    {
      variant: "ghost",
      colorScheme: "neutral",
      css: createGhostCompoundVariant({
        color: "$neutral12",
        bgColorHover: "$neutral4",
        bgColorActive: "$neutral5",
      }),
    },
    {
      variant: "ghost",
      colorScheme: "success",
      css: createGhostCompoundVariant({
        color: "$success11",
        bgColorHover: "$success4",
        bgColorActive: "$success5",
      }),
    },
    {
      variant: "ghost",
      colorScheme: "info",
      css: createGhostCompoundVariant({
        color: "$info11",
        bgColorHover: "$info4",
        bgColorActive: "$info5",
      }),
    },
    {
      variant: "ghost",
      colorScheme: "warning",
      css: createGhostCompoundVariant({
        color: "$warning11",
        bgColorHover: "$warning4",
        bgColorActive: "$warning5",
      }),
    },
    {
      variant: "ghost",
      colorScheme: "danger",
      css: createGhostCompoundVariant({
        color: "$danger11",
        bgColorHover: "$danger4",
        bgColorActive: "$danger5",
      }),
    },

    /* -------------------------------------------------------------------------------------------------
     * Compact sizes
     * -----------------------------------------------------------------------------------------------*/
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
      css: createCompactSizeCompoundVariant({ height: "$7", paddingX: "$2" }),
    },
    {
      size: "lg",
      compact: "true",
      css: createCompactSizeCompoundVariant({ height: "$8", paddingX: "$2_5" }),
    },
    {
      size: "xl",
      compact: "true",
      css: createCompactSizeCompoundVariant({ height: "$10", paddingX: "$3_5" }),
    },
  ],
});

export type ButtonVariants = VariantProps<typeof buttonStyles>;

/* -------------------------------------------------------------------------------------------------
 * ButtonGroup
 * -----------------------------------------------------------------------------------------------*/

export const buttonGroupStyles = css({
  display: "inline-flex",

  [`& .${buttonStyles}:focus`]: {
    zIndex: 1,
  },
});
