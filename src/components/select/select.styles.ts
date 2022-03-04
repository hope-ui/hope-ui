import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";

import { baseInputResetStyles } from "../input/input.styles";

/* -------------------------------------------------------------------------------------------------
 * Select - button
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

export const selectButtonStyles = css(baseInputResetStyles, {
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

export type SelectButtonVariants = VariantProps<typeof selectButtonStyles>;

/* -------------------------------------------------------------------------------------------------
 * Select - button text
 * -----------------------------------------------------------------------------------------------*/

export const selectButtonTextStyles = css({
  display: "block",
  flexGrow: 1,
  flexShrink: 1,

  textAlign: "start",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

/* -------------------------------------------------------------------------------------------------
 * Select - button placeholder
 * -----------------------------------------------------------------------------------------------*/

export const selectButtonPlaceholderStyles = css(selectButtonTextStyles, {
  color: "$neutral9",
  opacity: 1,
});

/* -------------------------------------------------------------------------------------------------
 * Select - button icon
 * -----------------------------------------------------------------------------------------------*/

export const selectButtonIconStyles = css({
  flexGrow: 0,
  flexShrink: 0,

  marginInlineStart: "$0_5",

  fontSize: "1.2em",

  pointerEvents: "none",
});

/* -------------------------------------------------------------------------------------------------
 * Select - listbox (options list)
 * -----------------------------------------------------------------------------------------------*/

export const selectListboxStyles = css({
  zIndex: "$dropdown",
  position: "absolute",
  left: 0,
  top: "100%",

  overflowY: "scroll",
  maxHeight: "$60",
  width: "100%",

  margin: 0,

  boxShadow: "$md",
  border: "1px solid $colors$neutral7",
  borderRadius: "$md",
  backgroundColor: "$panelBg",

  py: "$1",
  px: 0,

  listStyle: "none",
});

/* -------------------------------------------------------------------------------------------------
 * Select - option
 * -----------------------------------------------------------------------------------------------*/

export const selectOptionStyles = css({
  position: "relative",

  py: "$2",
  px: "$4",

  color: "$neutral12",
  fontWeight: "$normal",

  cursor: "pointer",
  userSelect: "none",

  variants: {
    active: {
      true: {},
    },
    selected: {
      true: {
        backgroundColor: "$primary9",
        color: "white",
        fontWeight: "$medium",
      },
    },
    disabled: {
      true: {
        color: "$neutral8",
        cursor: "not-allowed",
      },
    },
  },
  compoundVariants: [
    {
      active: true,
      selected: false,
      css: {
        backgroundColor: "$primary3",
        color: "$primary11",
      },
    },
  ],
});
