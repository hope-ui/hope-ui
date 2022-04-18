import { VariantProps } from "@stitches/core";

import { css } from "../../styled-system/stitches.config";
import {
  toggleControlLabelStyles,
  toggleControlStyles,
  toggleWrapperStyles,
} from "../checkbox/checkbox.styles";

/* -------------------------------------------------------------------------------------------------
 * Switch - wrapper
 * -----------------------------------------------------------------------------------------------*/

export const switchWrapperStyles = css(toggleWrapperStyles, {
  variants: {
    labelPlacement: {
      start: {
        flexDirection: "row",
      },
      end: {
        flexDirection: "row-reverse",
      },
    },
  },
});

export type SwitchWrapperVariants = VariantProps<typeof switchWrapperStyles>;

/* -------------------------------------------------------------------------------------------------
 * Switch - label
 * -----------------------------------------------------------------------------------------------*/

export const switchLabelStyles = css(toggleControlLabelStyles);

/* -------------------------------------------------------------------------------------------------
 * Switch - control
 * -----------------------------------------------------------------------------------------------*/

export const switchControlStyles = css(toggleControlStyles, {
  borderRadius: "$full",

  transition: "background-color 250ms, border-color 250ms, box-shadow 250ms",

  // Switch trackball
  "&::before": {
    content: "''",
    position: "absolute",
    top: "2px",
    left: "2px",
    zIndex: "1",
    borderRadius: "$full",
    boxShadow: "$sm",
    transition: "250ms",
  },

  variants: {
    variant: {
      outline: {
        "&::before": {
          backgroundColor: "$neutral7",
        },

        "&[data-checked]::before": {
          backgroundColor: "$loContrast",
        },
      },
      filled: {
        "&::before": {
          backgroundColor: "$loContrast",
        },
      },
    },
    size: {
      sm: {
        height: "16px",
        width: "26px",

        "&::before": {
          boxSize: "10px",
        },

        "&[data-checked]::before": {
          transform: "translateX(10px)",
        },
      },
      md: {
        columnGap: "2px",
        height: "20px",
        width: "34px",

        "&::before": {
          boxSize: "14px",
        },

        "&[data-checked]::before": {
          transform: "translateX(14px)",
        },
      },
      lg: {
        columnGap: "4px",
        height: "28px",
        width: "50px",

        "&::before": {
          boxSize: "22px",
        },

        "&[data-checked]::before": {
          transform: "translateX(22px)",
        },
      },
    },
  },
});

export type SwitchControlVariants = VariantProps<typeof switchControlStyles>;
