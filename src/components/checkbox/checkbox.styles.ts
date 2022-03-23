import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";
import { SystemStyleObject } from "@/styled-system/types";

/* -------------------------------------------------------------------------------------------------
 * Toggle - base style for checkbox, radio and switch
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

    "&[data-focus]": {
      boxShadow: `0 0 0 3px $colors${config.boxShadowColorFocus}`,
      borderColor: config.borderColorFocus,
    },
  };
}

export const toggleContainerStyles = css({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  gap: "$2",

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
  },
});

export const toggleControlLabelStyles = css({
  cursor: "pointer",
  userSelect: "none",

  "&[data-disabled]": {
    opacity: "0.5",
    cursor: "not-allowed",
  },
});

export const toggleControlStyles = css({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,

  height: "100%",

  outline: "none",

  padding: 0,

  verticalAlign: "middle",
  cursor: "pointer",
  userSelect: "none",
  transition: "border-color 250ms, box-shadow 250ms",

  "&[data-disabled]": {
    opacity: "0.5",
    cursor: "not-allowed",
  },

  "&[data-invalid]": {
    borderColor: "$danger8",
    color: "$danger9",
  },

  "&[data-focus][data-invalid]": {
    boxShadow: "0 0 0 3px $colors$danger5",
    borderColor: "$danger8",
  },

  "&[data-checked], &[data-focus][data-checked]": {
    borderColor: "transparent",
    backgroundColor: "currentColor",
  },

  variants: {
    variant: {
      outline: {
        border: "1px solid $colors$neutral8",
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

/* -------------------------------------------------------------------------------------------------
 * Checkbox - container
 * -----------------------------------------------------------------------------------------------*/

export const checkboxContainerStyles = css(toggleContainerStyles);

/* -------------------------------------------------------------------------------------------------
 * Checkbox - label
 * -----------------------------------------------------------------------------------------------*/

export const checkboxLabelStyles = css(toggleControlLabelStyles);

/* -------------------------------------------------------------------------------------------------
 * Checkbox - control
 * -----------------------------------------------------------------------------------------------*/

export const checkboxControlStyles = css(toggleControlStyles, {
  borderRadius: "$sm",

  "& svg": {
    color: "$loContrast",
  },

  "&[data-indeterminate], &[data-focus][data-indeterminate]": {
    borderColor: "transparent",
    backgroundColor: "currentColor",
  },
});

export type CheckboxControlVariants = VariantProps<typeof checkboxControlStyles>;
