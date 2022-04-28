import { VariantProps } from "@stitches/core";

import { css } from "../../styled-system/stitches.config";
import { SystemStyleObject } from "../../styled-system/types";

/* -------------------------------------------------------------------------------------------------
 * Tabs
 * -----------------------------------------------------------------------------------------------*/

export const tabsStyles = css({
  variants: {
    orientation: {
      horizontal: {
        display: "block",
      },
      vertical: {
        display: "flex",
      },
    },
  },
});

export type TabsVariants = VariantProps<typeof tabsStyles>;

/* -------------------------------------------------------------------------------------------------
 * TabList
 * -----------------------------------------------------------------------------------------------*/

export const tabListStyles = css({
  display: "flex",

  color: "$neutral11",
  fontWeight: "$normal",

  variants: {
    variant: {
      underline: {
        borderWidth: 0,
        borderStyle: "solid",
        borderColor: "$neutral7",
      },
      outline: {
        borderStyle: "solid",
        borderColor: "$neutral7",
      },
      cards: {
        borderStyle: "solid",
        borderColor: "$neutral7",
      },
      pills: {
        gap: "$1_5",
      },
    },
    alignment: {
      start: {
        justifyContent: "flex-start",
      },
      end: {
        justifyContent: "flex-end",
      },
      center: {
        justifyContent: "center",
      },
      apart: {
        justifyContent: "space-between",
      },
    },
    orientation: {
      horizontal: {
        flexDirection: "row",
      },
      vertical: {
        flexDirection: "column",
      },
    },
  },
  compoundVariants: [
    /* -------------------------------------------------------------------------------------------------
     * Variant - underline + orientation
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "underline",
      orientation: "horizontal",
      css: {
        borderBottomWidth: "1px",
      },
    },
    {
      variant: "underline",
      orientation: "vertical",
      css: {
        borderInlineEndWidth: "1px",
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - outline + orientation
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "outline",
      orientation: "horizontal",
      css: {
        mb: "-1px",
        borderBottomWidth: "1px",
      },
    },
    {
      variant: "outline",
      orientation: "vertical",
      css: {
        marginInlineEnd: "-1px",
        borderInlineEndWidth: "1px",
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - cards + orientation
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "cards",
      orientation: "horizontal",
      css: {
        mb: "-1px",
        borderBottomWidth: "1px",
      },
    },
    {
      variant: "cards",
      orientation: "vertical",
      css: {
        marginInlineEnd: "-1px",
        borderInlineEndWidth: "1px",
      },
    },
  ],
});

export type TabListVariants = VariantProps<typeof tabListStyles>;

/* -------------------------------------------------------------------------------------------------
 * Tab
 * -----------------------------------------------------------------------------------------------*/

function createSelectedColorVariant(color: string): SystemStyleObject {
  return {
    "&[aria-selected='true']": {
      color,
    },
  };
}

function createPillsAndColorVariant(config: {
  color: string;
  bgColor: string;
  bgColorHover: string;
}): SystemStyleObject {
  return {
    "&[aria-selected='true']": {
      color: config.color,
      backgroundColor: config.bgColor,
    },

    "&[aria-selected='true']:hover": {
      backgroundColor: config.bgColorHover,
    },
  };
}

export const tabStyles = css({
  appearance: "none",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  outline: "none",

  border: "$none",
  backgroundColor: "transparent",

  px: "$4",

  color: "inherit",
  fontWeight: "inherit",

  cursor: "pointer",

  transitionProperty:
    "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform",
  transitionDuration: "250ms",

  "&:focus": {
    zIndex: 1,
    outline: "none",
    boxShadow: "$outline",
  },

  "&:disabled": {
    opacity: 0.4,
    cursor: "not-allowed",
  },

  variants: {
    variant: {
      underline: {
        borderWidth: 0,
        borderStyle: "solid",
        borderColor: "transparent",

        "&[aria-selected='true']": {
          borderColor: "currentColor",
        },

        "&:active": {
          backgroundColor: "$neutral4",
        },
      },
      outline: {
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "transparent",

        "&[aria-selected='true']": {
          borderColor: "inherit",
        },
      },
      cards: {
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "inherit",
        backgroundColor: "$neutral3",

        "&[aria-selected='true']": {
          borderColor: "inherit",
          backgroundColor: "$loContrast",
        },
      },
      pills: {
        borderRadius: "$sm",

        "&:hover": {
          backgroundColor: "$neutral3",
        },

        "&:hover:disabled": {
          backgroundColor: "transparent",
        },
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
      sm: {
        py: "$1",
        fontSize: "$sm",
      },
      md: {
        py: "$2",
        fontSize: "$base",
      },
      lg: {
        py: "$3",
        fontSize: "$lg",
      },
    },
    orientation: {
      horizontal: {},
      vertical: {},
    },
    fitted: {
      true: {
        flex: 1,
      },
    },
  },
  compoundVariants: [
    /* -------------------------------------------------------------------------------------------------
     * Variant - underline + colorScheme
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "underline",
      colorScheme: "primary",
      css: createSelectedColorVariant("$primary11"),
    },
    {
      variant: "underline",
      colorScheme: "accent",
      css: createSelectedColorVariant("$accent11"),
    },
    {
      variant: "underline",
      colorScheme: "neutral",
      css: createSelectedColorVariant("$neutral12"),
    },
    {
      variant: "underline",
      colorScheme: "success",
      css: createSelectedColorVariant("$success11"),
    },
    {
      variant: "underline",
      colorScheme: "info",
      css: createSelectedColorVariant("$info11"),
    },
    {
      variant: "underline",
      colorScheme: "warning",
      css: createSelectedColorVariant("$warning11"),
    },
    {
      variant: "underline",
      colorScheme: "danger",
      css: createSelectedColorVariant("$danger11"),
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - outline + colorScheme
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "outline",
      colorScheme: "primary",
      css: createSelectedColorVariant("$primary11"),
    },
    {
      variant: "outline",
      colorScheme: "accent",
      css: createSelectedColorVariant("$accent11"),
    },
    {
      variant: "outline",
      colorScheme: "neutral",
      css: createSelectedColorVariant("$neutral12"),
    },
    {
      variant: "outline",
      colorScheme: "success",
      css: createSelectedColorVariant("$success11"),
    },
    {
      variant: "outline",
      colorScheme: "info",
      css: createSelectedColorVariant("$info11"),
    },
    {
      variant: "outline",
      colorScheme: "warning",
      css: createSelectedColorVariant("$warning11"),
    },
    {
      variant: "outline",
      colorScheme: "danger",
      css: createSelectedColorVariant("$danger11"),
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - cards + colorScheme
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "cards",
      colorScheme: "primary",
      css: createSelectedColorVariant("$primary11"),
    },
    {
      variant: "cards",
      colorScheme: "accent",
      css: createSelectedColorVariant("$accent11"),
    },
    {
      variant: "cards",
      colorScheme: "neutral",
      css: createSelectedColorVariant("$neutral12"),
    },
    {
      variant: "cards",
      colorScheme: "success",
      css: createSelectedColorVariant("$success11"),
    },
    {
      variant: "cards",
      colorScheme: "info",
      css: createSelectedColorVariant("$info11"),
    },
    {
      variant: "cards",
      colorScheme: "warning",
      css: createSelectedColorVariant("$warning11"),
    },
    {
      variant: "cards",
      colorScheme: "danger",
      css: createSelectedColorVariant("$danger11"),
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - pills + colorScheme
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "pills",
      colorScheme: "primary",
      css: createPillsAndColorVariant({
        color: "$primary11",
        bgColor: "$primary3",
        bgColorHover: "$primary4",
      }),
    },
    {
      variant: "pills",
      colorScheme: "accent",
      css: createPillsAndColorVariant({
        color: "$accent11",
        bgColor: "$accent3",
        bgColorHover: "$accent4",
      }),
    },
    {
      variant: "pills",
      colorScheme: "neutral",
      css: createPillsAndColorVariant({
        color: "$neutral12",
        bgColor: "$neutral3",
        bgColorHover: "$neutral4",
      }),
    },
    {
      variant: "pills",
      colorScheme: "success",
      css: createPillsAndColorVariant({
        color: "$success11",
        bgColor: "$success3",
        bgColorHover: "$success4",
      }),
    },
    {
      variant: "pills",
      colorScheme: "info",
      css: createPillsAndColorVariant({
        color: "$info11",
        bgColor: "$info3",
        bgColorHover: "$info4",
      }),
    },
    {
      variant: "pills",
      colorScheme: "warning",
      css: createPillsAndColorVariant({
        color: "$warning11",
        bgColor: "$warning3",
        bgColorHover: "$warning4",
      }),
    },
    {
      variant: "pills",
      colorScheme: "danger",
      css: createPillsAndColorVariant({
        color: "$danger11",
        bgColor: "$danger3",
        bgColorHover: "$danger4",
      }),
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - underline + orientation
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "underline",
      orientation: "horizontal",
      css: {
        borderBottomWidth: "2px",
        marginBottom: "-1px",
      },
    },
    {
      variant: "underline",
      orientation: "vertical",
      css: {
        borderInlineEndWidth: "2px",
        marginInlineEnd: "-1px",
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - outline + orientation
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "outline",
      orientation: "horizontal",
      css: {
        mb: "-1px",
        borderTopRadius: "$sm",

        "&[aria-selected='true']": {
          borderBottomColor: "$loContrast",
        },
      },
    },
    {
      variant: "outline",
      orientation: "vertical",
      css: {
        marginInlineEnd: "-1px",
        borderStartRadius: "$radii$sm",

        "&[aria-selected='true']": {
          borderInlineEndColor: "$colors$loContrast",
        },
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - cards + orientation
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "cards",
      orientation: "horizontal",
      css: {
        mb: "-1px",
        borderBottomWidth: "1px",

        "&:not(:last-of-type)": {
          marginInlineEnd: "-1px",
        },

        "&[aria-selected='true']": {
          borderTopColor: "currentColor",
          borderBottomColor: "transparent",
        },
      },
    },
    {
      variant: "cards",
      orientation: "vertical",
      css: {
        marginInlineEnd: "-1px",
        borderInlineEndWidth: "1px",

        "&:not(:last-of-type)": {
          mb: "-1px",
        },

        "&[aria-selected='true']": {
          borderInlineStartColor: "currentColor",
          borderInlineEndColor: "transparent",
        },
      },
    },
  ],
});

export type TabVariants = VariantProps<typeof tabStyles>;

/* -------------------------------------------------------------------------------------------------
 * TabPanel
 * -----------------------------------------------------------------------------------------------*/

export const tabPanelStyles = css({
  outline: "none",
  padding: "$4",
});
