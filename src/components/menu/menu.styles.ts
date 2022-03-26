import { css } from "@/styled-system/stitches.config";

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

  padding: "$1",
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

  py: "$2",
  px: "$3",

  color: "$neutral11",
  fontSize: "$xs",
  lineHeight: "$4",
});

/* -------------------------------------------------------------------------------------------------
 * Menu - item
 * -----------------------------------------------------------------------------------------------*/

export const menuItemStyles = css({
  position: "relative",

  display: "flex",
  alignItems: "center",

  borderRadius: "$sm",

  py: "$2",
  px: "$3",

  color: "$neutral12",
  fontSize: "$base",
  fontWeight: "$normal",
  lineHeight: "$6",

  cursor: "pointer",
  userSelect: "none",

  "&[data-disabled]": {
    color: "$neutral8",
    cursor: "not-allowed",
  },

  [`&[data-active]`]: {
    backgroundColor: "$neutral4",
  },
});
