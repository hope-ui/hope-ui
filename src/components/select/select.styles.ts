import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";

import { baseInputResetStyles } from "../input/input.styles";

/* -------------------------------------------------------------------------------------------------
 * Select - trigger
 * -----------------------------------------------------------------------------------------------*/

function createVariantAndSizeCompoundVariants(
  variant: string,
  paddingStart?: string | number,
  paddingEnd?: string | number
) {
  return Object.entries({
    xs: {
      start: paddingStart ?? "$2",
      end: paddingEnd ?? "$1",
    },
    sm: {
      start: paddingStart ?? "$2_5",
      end: paddingEnd ?? "$1_5",
    },
    md: {
      start: paddingStart ?? "$3",
      end: paddingEnd ?? "$2",
    },
    lg: {
      start: paddingStart ?? "$4",
      end: paddingEnd ?? "$3",
    },
  }).map(([key, value]) => ({
    variant: variant,
    size: key,
    css: {
      paddingInlineStart: value.start,
      paddingInlineEnd: value.end,
    },
  }));
}

export const selectTriggerStyles = css(baseInputResetStyles, {
  appearance: "none",

  display: "inline-flex",
  alignItems: "center",

  outline: "none",

  cursor: "pointer",

  "&:focus": {
    outline: "none",
  },

  compoundVariants: [
    ...createVariantAndSizeCompoundVariants("outline"),
    ...createVariantAndSizeCompoundVariants("filled"),
    ...createVariantAndSizeCompoundVariants("unstyled", 0, 0),
  ],
});

export type SelectTriggerVariants = VariantProps<typeof selectTriggerStyles>;

/* -------------------------------------------------------------------------------------------------
 * Select - trigger value
 * -----------------------------------------------------------------------------------------------*/

export const selectValueStyles = css({
  display: "block",
  flexGrow: 1,
  flexShrink: 1,

  textAlign: "start",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

/* -------------------------------------------------------------------------------------------------
 * Select - trigger placeholder
 * -----------------------------------------------------------------------------------------------*/

export const selectPlaceholderStyles = css(selectValueStyles, {
  color: "$neutral9",
  opacity: 1,
});

/* -------------------------------------------------------------------------------------------------
 * Select - trigger icon
 * -----------------------------------------------------------------------------------------------*/

export const selectIconStyles = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexGrow: 0,
  flexShrink: 0,

  marginInlineStart: "auto",

  color: "$neutral10",
  fontSize: "1.2em",
  pointerEvents: "none",
});

/* -------------------------------------------------------------------------------------------------
 * Select - content (the floating panel)
 * -----------------------------------------------------------------------------------------------*/

export const selectContentStyles = css({
  zIndex: "$dropdown",
  position: "absolute",
  left: 0,
  top: "100%",

  display: "flex",
  flexDirection: "column",
  width: "100%",
  overflow: "hidden",

  margin: 0,

  boxShadow: "$md",
  border: "1px solid $colors$neutral7",
  borderRadius: "$sm",
  backgroundColor: "$panel",

  padding: 0,
});

/* -------------------------------------------------------------------------------------------------
 * Select - listbox
 * -----------------------------------------------------------------------------------------------*/

export const selectListboxStyles = css({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  maxHeight: "$60",
  width: "100%",
  overflowY: "auto",

  margin: 0,
  padding: "$1", //0,

  listStyle: "none",
});

/* -------------------------------------------------------------------------------------------------
 * Select - optgroup
 * -----------------------------------------------------------------------------------------------*/

export const selectOptGroupStyles = css({});

/* -------------------------------------------------------------------------------------------------
 * Select - label
 * -----------------------------------------------------------------------------------------------*/

export const selectLabelStyles = css({
  display: "flex",
  alignItems: "center",

  py: "$2",
  px: "$3",

  color: "$neutral11",
  fontSize: "$xs",
  lineHeight: "$4",
});

/* -------------------------------------------------------------------------------------------------
 * Select - option
 * -----------------------------------------------------------------------------------------------*/

export const selectOptionStyles = css({
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

  "&[aria-selected=true]": {
    backgroundColor: "$primary3",
    color: "$primary11",
  },

  [`&[data-active][aria-selected=true]`]: {
    backgroundColor: "$primary4",
  },
});
