import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";
import { SystemStyleObject } from "@/styled-system/types";

/* -------------------------------------------------------------------------------------------------
 * CSS reset for input [type=checkbox] and [type=radio]
 * -----------------------------------------------------------------------------------------------*/

export const baseCheckboxAndRadioResetStyles = css({
  appearance: "none",

  display: "inline-block",
  flexShrink: 0,

  outline: "none",

  backgroundOrigin: "border-box",

  padding: 0,

  verticalAlign: "middle",

  colorAdjust: "exact",
  userSelect: "none",

  transition: "border-color 250ms, box-shadow 250ms",
});

/* -------------------------------------------------------------------------------------------------
 * Checkbox
 * -----------------------------------------------------------------------------------------------*/

interface ColorVariantConfig {
  color: string;
  boxShadowColorFocus: string;
  borderColorFocus: string;
}

function createColorVariant(config: ColorVariantConfig): SystemStyleObject {
  return {
    color: config.color,

    "&:focus": {
      boxShadow: `0 0 0 3px $colors${config.boxShadowColorFocus}`,
      borderColor: config.borderColorFocus,
    },
  };
}

export const checkboxStyles = css(baseCheckboxAndRadioResetStyles, {
  borderRadius: "$sm",

  "&:disabled": {
    opacity: 0.4,
    cursor: "not-allowed",
  },

  "&:checked": {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E")`,
  },

  "&:indeterminate": {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 16'%3E%3Cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8h8'/%3E%3C/svg%3E")`,
  },

  "&:checked, &:indeterminate": {
    borderColor: "transparent",
    backgroundColor: "currentColor",
    backgroundSize: "100% 100%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },

  "&[aria-invalid=true]": {
    borderColor: "$danger8",
    color: "$danger9",
  },

  "&[aria-invalid=true]:focus": {
    boxShadow: "0 0 0 3px $colors$danger5",
    borderColor: "$danger8",
  },

  [`&:checked:hover,
    &:checked:focus,
    &[aria-invalid=true]:checked,
    &[aria-invalid=true]:checked:hover,
    &[aria-invalid=true]:checked:focus,
    &:indeterminate:hover,
    &:indeterminate:focus,
    &[aria-invalid=true]:indeterminate,
    &[aria-invalid=true]:indeterminate:hover,
    &[aria-invalid=true]:indeterminate:focus`]: {
    borderColor: "transparent",
    backgroundColor: "currentColor",
  },

  variants: {
    variant: {
      outline: {
        border: "2px solid $neutral7",
        backgroundColor: "transparent",

        "&:hover": {
          borderColor: "$neutral8",
        },

        "&[aria-invalid=true]:hover": {
          borderColor: "$danger8",
        },
      },
      filled: {
        border: "2px solid transparent",
        backgroundColor: "$neutral4",

        "&:hover, &:focus": {
          backgroundColor: "$neutral5",
        },
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

export type CheckboxVariants = VariantProps<typeof checkboxStyles>;

/* -------------------------------------------------------------------------------------------------
 * Label
 * -----------------------------------------------------------------------------------------------*/

export const checkboxLabelStyles = css({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",

  cursor: "pointer",

  "&[data-disabled]": {
    opacity: "0.4",
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
    labelPosition: {
      left: {
        flexDirection: "row-reverse",
      },
      right: {
        flexDirection: "row",
      },
    },
  },
});

export type CheckboxLabelVariants = VariantProps<typeof checkboxLabelStyles>;

/* -------------------------------------------------------------------------------------------------
 * Checkbox span text
 * -----------------------------------------------------------------------------------------------*/

function createSizeAndLabelPositionCompoundVariants() {
  return Object.entries({
    sm: "$1_5",
    md: "$2",
    lg: "$2",
  }).flatMap(([key, value]) => [
    {
      labelPosition: "left",
      size: key,
      css: { marginInlineEnd: value },
    },
    {
      labelPosition: "right",
      size: key,
      css: { marginInlineStart: value },
    },
  ]);
}

export const checkboxSpanStyles = css({
  variants: {
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    labelPosition: {
      left: {},
      right: {},
    },
  },
  compoundVariants: createSizeAndLabelPositionCompoundVariants(),
});

export type CheckboxSpanVariants = VariantProps<typeof checkboxSpanStyles>;
