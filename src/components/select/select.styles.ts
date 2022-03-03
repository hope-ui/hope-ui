import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";

import { baseInputResetStyles } from "../input/input.styles";

/* -------------------------------------------------------------------------------------------------
 * Select - button
 * -----------------------------------------------------------------------------------------------*/

function createVariantAndSizeCompoundVariants(variant: string, paddingX?: string | number) {
  return Object.entries({
    xs: paddingX ?? "$2",
    sm: paddingX ?? "$2_5",
    md: paddingX ?? "$3",
    lg: paddingX ?? "$4",
  }).map(([key, value]) => ({
    variant: variant,
    size: key,
    css: { px: value },
  }));
}

export const selectButtonStyles = css(baseInputResetStyles, {
  appearance: "none",

  display: "inline-flex",
  alignItems: "center",

  outline: "none",

  "&:focus": {
    outline: "none",
  },

  compoundVariants: [
    ...createVariantAndSizeCompoundVariants("outline"),
    ...createVariantAndSizeCompoundVariants("filled"),
    ...createVariantAndSizeCompoundVariants("unstyled", 0),
  ],
});

export type SelectButtonVariants = VariantProps<typeof selectButtonStyles>;

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
 * Select - button icon
 * -----------------------------------------------------------------------------------------------*/

export const selectButtonIconStyles = css({
  flexGrow: 0,
  flexShrink: 0,

  marginInlineStart: "$0_5",

  color: "$neutral10",
  fontSize: "1.3em",

  pointerEvents: "none",
});

/* -------------------------------------------------------------------------------------------------
 * Select - options list
 * -----------------------------------------------------------------------------------------------*/

export const selectOptionsListStyles = css({
  zIndex: "$dropdown",
  overflow: "auto",
  maxHeight: "$60",

  margin: 0,

  boxShadow: "$lg",
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

  cursor: "default",
  userSelect: "none",
  transition: "background-color 250ms",

  variants: {
    active: {
      true: {
        backgroundColor: "$primary3",
        color: "$primary11",
      },
    },
    selected: {
      true: {
        fontWeight: "$medium",
      },
    },
    disabled: {
      true: {
        color: "$neutral8",
      },
    },
  },
  compoundVariants: [
    {
      active: true,
      disabled: true,
      css: {
        backgroundColor: "inherit",
        color: "$neutral8",
      },
    },
  ],
});
