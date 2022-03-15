import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";
import { SystemStyleObject } from "@/styled-system/types";
import { visuallyHiddenStyles } from "@/theme/utils";

/* -------------------------------------------------------------------------------------------------
 * Checkbox - input
 * -----------------------------------------------------------------------------------------------*/

export const checkboxInputStyles = css(visuallyHiddenStyles);

/* -------------------------------------------------------------------------------------------------
 * Checkbox - container
 * -----------------------------------------------------------------------------------------------*/

export const checkboxContainerStyles = css({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",

  borderColor: "$neutral8",

  cursor: "pointer",
  userSelect: "none",

  "&[data-disabled]": {
    opacity: "0.5",
    cursor: "not-allowed",
  },

  variants: {
    size: {
      sm: {
        fontSize: "$sm",
        lineHeight: "$5",
      },
      md: {
        fontSize: "$base",
        lineHeight: "$6",
      },
      lg: {
        fontSize: "$lg",
        lineHeight: "$7",
      },
    },
    labelPlacement: {
      start: {
        flexDirection: "row-reverse",
      },
      end: {
        flexDirection: "row",
      },
    },
  },
});

export type CheckboxContainerVariants = VariantProps<typeof checkboxContainerStyles>;

/* -------------------------------------------------------------------------------------------------
 * Checkbox - control
 * -----------------------------------------------------------------------------------------------*/

interface ColorVariantConfig {
  color: string;
  boxShadowColorFocus: string;
  borderColorFocus: string;
}

function createColorVariant(config: ColorVariantConfig): SystemStyleObject {
  return {
    color: config.color,

    "&[data-disabled]": {
      color: "$neutral10",
    },

    [`.${checkboxInputStyles}:focus + &`]: {
      boxShadow: `0 0 0 3px $colors${config.boxShadowColorFocus}`,
      borderColor: config.borderColorFocus,
    },
  };
}

export const checkboxControlStyles = css({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,

  height: "100%",

  outline: "none",

  borderRadius: "$sm",

  padding: 0,

  verticalAlign: "middle",
  userSelect: "none",
  transition: "border-color 250ms, box-shadow 250ms",

  "& svg": {
    color: "$surface",
  },

  "&[data-disabled]": {
    opacity: "0.5",
    cursor: "not-allowed",
  },

  "&[data-invalid]": {
    borderColor: "$danger8",
    color: "$danger9",
  },

  [`.${checkboxInputStyles}:focus + &[data-invalid]`]: {
    boxShadow: "0 0 0 3px $colors$danger5",
    borderColor: "$danger8",
  },

  [`&[data-checked],
    .${checkboxInputStyles}:focus + &[data-checked],
    &[data-indeterminate],
    .${checkboxInputStyles}:focus + &[data-indeterminate]`]: {
    borderColor: "transparent",
    backgroundColor: "currentColor",
  },

  variants: {
    variant: {
      outline: {
        border: "1px solid",
        borderColor: "inherit", // allow passing borderColor style props to parent container
        backgroundColor: "transparent",
      },
      filled: {
        border: "1px solid transparent",
        backgroundColor: "$neutral7",
      },
    },
    colorScheme: {
      primary: createColorVariant({
        color: "$primary9",
        boxShadowColorFocus: "$primary5",
        borderColorFocus: "$primary8",
      }),
      neutral: createColorVariant({
        color: "$neutral9",
        boxShadowColorFocus: "$neutral5",
        borderColorFocus: "$neutral8",
      }),
      success: createColorVariant({
        color: "$success9",
        boxShadowColorFocus: "$success5",
        borderColorFocus: "$success8",
      }),
      info: createColorVariant({
        color: "$info9",
        boxShadowColorFocus: "$info5",
        borderColorFocus: "$info8",
      }),
      warning: createColorVariant({
        color: "$warning9",
        boxShadowColorFocus: "$warning5",
        borderColorFocus: "$warning8",
      }),
      danger: createColorVariant({
        color: "$danger9",
        boxShadowColorFocus: "$danger5",
        borderColorFocus: "$danger8",
      }),
    },
    size: {
      sm: {
        boxSize: "$3",
      },
      md: {
        boxSize: "$4",
      },
      lg: {
        boxSize: "$5",
      },
    },
  },
});

export type CheckboxControlVariants = VariantProps<typeof checkboxControlStyles>;

/* -------------------------------------------------------------------------------------------------
 * Checkbox - span containing the text label
 * -----------------------------------------------------------------------------------------------*/

function createSizeAndLabelPositionCompoundVariants() {
  return Object.entries({
    sm: "$2",
    md: "$2",
    lg: "$2",
  }).flatMap(([key, value]) => [
    {
      labelPlacement: "start",
      size: key,
      css: { marginInlineEnd: value },
    },
    {
      labelPlacement: "end",
      size: key,
      css: { marginInlineStart: value },
    },
  ]);
}

export const checkboxLabelStyles = css({
  variants: {
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    labelPlacement: {
      start: {},
      end: {},
    },
  },
  compoundVariants: createSizeAndLabelPositionCompoundVariants(),
});
