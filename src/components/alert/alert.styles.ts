import { VariantProps } from "@stitches/core";

import { css } from "../../styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * AlertIcon
 * -----------------------------------------------------------------------------------------------*/

export const alertIconStyles = css({
  flexShrink: 0,
});

/* -------------------------------------------------------------------------------------------------
 * AlertTitle
 * -----------------------------------------------------------------------------------------------*/

export const alertTitleStyles = css({
  fontWeight: "$semibold",
});

/* -------------------------------------------------------------------------------------------------
 * AlertDescription
 * -----------------------------------------------------------------------------------------------*/

export const alertDescriptionStyles = css({
  display: "inline-block",
});

/* -------------------------------------------------------------------------------------------------
 * Alert
 * -----------------------------------------------------------------------------------------------*/

export const alertStyles = css({
  position: "relative",

  display: "flex",
  alignItems: "center",

  borderRadius: "$sm",

  px: "$4",
  py: "$3",

  fontSize: "$base",
  lineHeight: "$6",

  variants: {
    variant: {
      solid: {},
      subtle: {},
      "left-accent": {
        borderLeftStyle: "solid",
        borderLeftWidth: "$sizes$1",
      },
      "top-accent": {
        borderTopStyle: "solid",
        borderTopWidth: "$sizes$1",
      },
    },
    status: {
      success: {},
      info: {},
      warning: {},
      danger: {},
    },
  },
  compoundVariants: [
    /* -------------------------------------------------------------------------------------------------
     * Variant - solid
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "solid",
      status: "success",
      css: {
        backgroundColor: "$success9",
        color: "white",
      },
    },
    {
      variant: "solid",
      status: "info",
      css: {
        backgroundColor: "$info9",
        color: "white",
      },
    },
    {
      variant: "solid",
      status: "warning",
      css: {
        backgroundColor: "$warning9",
        color: "$blackAlpha12",
      },
    },
    {
      variant: "solid",
      status: "danger",
      css: {
        backgroundColor: "$danger9",
        color: "white",
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - subtle
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "subtle",
      status: "success",
      css: {
        backgroundColor: "$success3",
        color: "$success11",

        [`& .${alertIconStyles}`]: {
          color: "$success9",
        },
      },
    },
    {
      variant: "subtle",
      status: "info",
      css: {
        backgroundColor: "$info3",
        color: "$info11",

        [`& .${alertIconStyles}`]: {
          color: "$info9",
        },
      },
    },
    {
      variant: "subtle",
      status: "warning",
      css: {
        backgroundColor: "$warning3",
        color: "$warning11",

        [`& .${alertIconStyles}`]: {
          color: "$warning9",
        },
      },
    },
    {
      variant: "subtle",
      status: "danger",
      css: {
        backgroundColor: "$danger3",
        color: "$danger11",

        [`& .${alertIconStyles}`]: {
          color: "$danger9",
        },
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - "left-accent"
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "left-accent",
      status: "success",
      css: {
        borderLeftColor: "$success9",
        backgroundColor: "$success3",
        color: "$success11",

        [`& .${alertIconStyles}`]: {
          color: "$success9",
        },
      },
    },
    {
      variant: "left-accent",
      status: "info",
      css: {
        borderLeftColor: "$info9",
        backgroundColor: "$info3",
        color: "$info11",

        [`& .${alertIconStyles}`]: {
          color: "$info9",
        },
      },
    },
    {
      variant: "left-accent",
      status: "warning",
      css: {
        borderLeftColor: "$warning9",
        backgroundColor: "$warning3",
        color: "$warning11",

        [`& .${alertIconStyles}`]: {
          color: "$warning9",
        },
      },
    },
    {
      variant: "left-accent",
      status: "danger",
      css: {
        borderLeftColor: "$danger9",
        backgroundColor: "$danger3",
        color: "$danger11",

        [`& .${alertIconStyles}`]: {
          color: "$danger9",
        },
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - "top-accent"
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "top-accent",
      status: "success",
      css: {
        borderTopColor: "$success9",
        backgroundColor: "$success3",
        color: "$success11",

        [`& .${alertIconStyles}`]: {
          color: "$success9",
        },
      },
    },
    {
      variant: "top-accent",
      status: "info",
      css: {
        borderTopColor: "$info9",
        backgroundColor: "$info3",
        color: "$info11",

        [`& .${alertIconStyles}`]: {
          color: "$info9",
        },
      },
    },
    {
      variant: "top-accent",
      status: "warning",
      css: {
        borderTopColor: "$warning9",
        backgroundColor: "$warning3",
        color: "$warning11",

        [`& .${alertIconStyles}`]: {
          color: "$warning9",
        },
      },
    },
    {
      variant: "top-accent",
      status: "danger",
      css: {
        borderTopColor: "$danger9",
        backgroundColor: "$danger3",
        color: "$danger11",

        [`& .${alertIconStyles}`]: {
          color: "$danger9",
        },
      },
    },
  ],
});

export type AlertVariants = VariantProps<typeof alertStyles>;
