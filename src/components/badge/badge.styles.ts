import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * Badge
 * -----------------------------------------------------------------------------------------------*/

export const badgeStyles = css({
  display: "inline-block",

  borderRadius: "$sm",

  py: "$0_5",
  px: "$1",

  fontSize: "$xs",
  fontWeight: "$bold",
  lineHeight: "$none",
  letterSpacing: "$wide",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  verticalAlign: "middle",

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
    },
    colorScheme: {
      primary: {},
      neutral: {},
      success: {},
      info: {},
      warning: {},
      danger: {},
    },
  },
  compoundVariants: [
    /* -------------------------------------------------------------------------------------------------
     * Variant - solid + color
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "solid",
      colorScheme: "primary",
      css: {
        color: "white",
        bgColor: "$primary9",
      },
    },
    {
      variant: "solid",
      colorScheme: "neutral",
      css: {
        color: "white",
        bgColor: "$neutral9",
      },
    },
    {
      variant: "solid",
      colorScheme: "success",
      css: {
        color: "white",
        bgColor: "$success9",
      },
    },
    {
      variant: "solid",
      colorScheme: "info",
      css: {
        color: "white",
        bgColor: "$info9",
      },
    },
    {
      variant: "solid",
      colorScheme: "warning",
      css: {
        color: "$blackAlpha12",
        bgColor: "$warning9",
      },
    },
    {
      variant: "solid",
      colorScheme: "danger",
      css: {
        color: "white",
        bgColor: "$danger9",
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - subtle + color
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "subtle",
      colorScheme: "primary",
      css: {
        color: "$primary11",
        bgColor: "$primary4",
      },
    },
    {
      variant: "subtle",
      colorScheme: "neutral",
      css: {
        color: "$neutral12",
        bgColor: "$neutral4",
      },
    },
    {
      variant: "subtle",
      colorScheme: "success",
      css: {
        color: "$success11",
        bgColor: "$success4",
      },
    },
    {
      variant: "subtle",
      colorScheme: "info",
      css: {
        color: "$info11",
        bgColor: "$info4",
      },
    },
    {
      variant: "subtle",
      colorScheme: "warning",
      css: {
        color: "$warning11",
        bgColor: "$warning4",
      },
    },
    {
      variant: "subtle",
      colorScheme: "danger",
      css: {
        color: "$danger11",
        bgColor: "$danger4",
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - outline + color
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "outline",
      colorScheme: "primary",
      css: {
        color: "$primary11",
        borderColor: "$primary7",
      },
    },
    {
      variant: "outline",
      colorScheme: "neutral",
      css: {
        color: "$neutral12",
        borderColor: "$neutral7",
      },
    },
    {
      variant: "outline",
      colorScheme: "success",
      css: {
        color: "$success11",
        borderColor: "$success7",
      },
    },
    {
      variant: "outline",
      colorScheme: "info",
      css: {
        color: "$info11",
        borderColor: "$info7",
      },
    },
    {
      variant: "outline",
      colorScheme: "warning",
      css: {
        color: "$warning11",
        borderColor: "$warning7",
      },
    },
    {
      variant: "outline",
      colorScheme: "danger",
      css: {
        color: "$danger11",
        borderColor: "$danger7",
      },
    },
  ],
});

export type BadgeVariants = VariantProps<typeof badgeStyles>;
