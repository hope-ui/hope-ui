import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";
import { SystemStyleObject } from "@/styled-system";

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

  color: "$primary9",
  verticalAlign: "middle",

  colorAdjust: "exact",
  userSelect: "none",

  transition: "border-color 250ms, box-shadow 250ms",

  variants: {
    size: {
      xs: {
        boxSize: "$4",
      },
      sm: {
        boxSize: "$5",
      },
      md: {
        boxSize: "$6",
      },
      lg: {
        boxSize: "$8",
      },
    },
  },
});

/* -------------------------------------------------------------------------------------------------
 * Checkbox
 * -----------------------------------------------------------------------------------------------*/

const commonOutlineAndFilledStyles: SystemStyleObject = {
  "&:focus": {
    boxShadow: "0 0 0 3px $colors$primary5",
    borderColor: "$primary8",
  },

  "&[aria-invalid=true]:focus": {
    borderColor: "$danger8",
  },
};

export const checkboxStyles = css(baseCheckboxAndRadioResetStyles, {
  borderRadius: "$sm",

  "&:disabled": {
    opacity: 0.4,
    cursor: "not-allowed",
  },

  "&:checked": {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E")`,
    borderColor: "transparent",
    backgroundColor: "currentColor",
    backgroundSize: "100% 100%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },

  "&:indeterminate": {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 16'%3E%3Cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8h8'/%3E%3C/svg%3E")`,
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

        ...commonOutlineAndFilledStyles,
      },
      filled: {
        border: "2px solid transparent",
        backgroundColor: "$neutral4",

        "&:hover, &:focus": {
          backgroundColor: "$neutral5",
        },

        ...commonOutlineAndFilledStyles,
      },
    },
    size: {
      lg: {
        borderRadius: "$md",
      },
    },
  },
});

export type CheckboxVariants = VariantProps<typeof checkboxStyles>;
