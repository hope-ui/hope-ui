import { VariantProps } from "@stitches/core";

import { SystemStyleObject } from "@/styled-system";
import { css } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * Menu - trigger
 * -----------------------------------------------------------------------------------------------*/

export const menuTriggerStyles = css({
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  outline: "none",
});

/* -------------------------------------------------------------------------------------------------
 * Menu - content (the floating panel)
 * -----------------------------------------------------------------------------------------------*/

export const menuContentStyles = css({
  zIndex: "$dropdown",
  position: "absolute",
  left: 0,
  top: "100%",

  display: "flex",
  flexDirection: "column",
  minWidth: "$56",
  overflowY: "auto",

  margin: 0,

  boxShadow: "$md",
  border: "1px solid $colors$neutral7",
  borderRadius: "$sm",
  backgroundColor: "$panel",

  px: 0,
  py: "$1",
});

/* -------------------------------------------------------------------------------------------------
 * Menu - group
 * -----------------------------------------------------------------------------------------------*/

export const menuGroupStyles = css({});

/* -------------------------------------------------------------------------------------------------
 * Menu - label
 * -----------------------------------------------------------------------------------------------*/

export const menuLabelStyles = css({
  display: "flex",
  alignItems: "center",

  mx: "$1",

  py: "$2",
  px: "$3",

  color: "$neutral11",
  fontSize: "$xs",
  lineHeight: "$4",
});

/* -------------------------------------------------------------------------------------------------
 * Menu - item
 * -----------------------------------------------------------------------------------------------*/

function createColorVariant(config: { color: string; bgColorActive: string }): SystemStyleObject {
  return {
    color: config.color,

    [`&[data-active]`]: {
      backgroundColor: config.bgColorActive,
    },
  };
}

export const menuItemStyles = css({
  position: "relative",

  display: "flex",
  alignItems: "center",

  mx: "$1",

  borderRadius: "$sm",

  py: "$2",
  px: "$3",

  color: "$neutral12",
  fontSize: "$base",
  fontWeight: "$normal",
  lineHeight: "$6",

  cursor: "pointer",
  userSelect: "none",

  transition: "color 250ms, background-color 250ms",

  "&[data-disabled]": {
    color: "$neutral8",
    cursor: "not-allowed",
  },

  [`&[data-active]`]: {
    backgroundColor: "$neutral4",
  },

  variants: {
    colorScheme: {
      primary: createColorVariant({ color: "$primary11", bgColorActive: "$primary3" }),
      neutral: createColorVariant({ color: "$neutral12", bgColorActive: "$neutral4" }),
      success: createColorVariant({ color: "$success11", bgColorActive: "$success3" }),
      info: createColorVariant({ color: "$info11", bgColorActive: "$info3" }),
      warning: createColorVariant({ color: "$warning11", bgColorActive: "$warning3" }),
      danger: createColorVariant({ color: "$danger11", bgColorActive: "$danger3" }),
    },
  },
});

export type MenuItemVariants = VariantProps<typeof menuItemStyles>;

/* -------------------------------------------------------------------------------------------------
 * Menu - item icon wrapper
 * -----------------------------------------------------------------------------------------------*/

export const menuItemIconWrapperStyles = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});
