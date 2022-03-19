import { VariantProps } from "@stitches/core";

import { css, keyframes } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * Progress - keyframes
 * -----------------------------------------------------------------------------------------------*/

const indeterminateProgress = keyframes({
  "0%": { left: "-40%" },
  "100%": { left: "100%" },
});

const stripe = keyframes({
  from: { backgroundPosition: "1rem 0" },
  to: { backgroundPosition: "0 0" },
});

/* -------------------------------------------------------------------------------------------------
 * Progress
 * -----------------------------------------------------------------------------------------------*/

export const progressStyles = css({
  position: "relative",
  overflow: "hidden",

  variants: {
    size: {
      xs: {
        height: "$1",
        fontSize: "4px",
      },
      sm: {
        height: "$2",
        fontSize: "6px",
      },
      md: {
        height: "$3",
        fontSize: "8px",
      },
      lg: {
        height: "$4",
        fontSize: "10px",
      },
    },
  },
});

export type ProgressVariants = VariantProps<typeof progressStyles>;

/* -------------------------------------------------------------------------------------------------
 * Progress - indicator
 * -----------------------------------------------------------------------------------------------*/

export const progressIndicatorStyles = css({
  position: "relative",
  height: "100%",

  transition: "width 600ms ease",

  variants: {
    striped: {
      true: {},
    },
    animated: {
      true: {},
    },
    indeterminate: {
      true: {
        position: "absolute",
        willChange: "left",
        minWidth: "50%",
        animation: `${indeterminateProgress} 1200ms ease infinite normal none running`,
      },
    },
  },

  compoundVariants: [
    {
      indeterminate: false,
      striped: true,
      css: {
        backgroundImage:
          "linear-gradient(45deg, $colors$progressStripe 25%, transparent 25%, transparent 50%, $colors$progressStripe 50%,  $colors$progressStripe 75%, transparent 75%, transparent)",
        backgroundSize: "1rem 1rem",
      },
    },
    {
      indeterminate: false,
      striped: true,
      animated: true,
      css: {
        animation: `${stripe} 750ms linear infinite`,
      },
    },
  ],
});

export type ProgressIndicatorVariants = VariantProps<typeof progressIndicatorStyles>;

/* -------------------------------------------------------------------------------------------------
 * Progress - label
 * -----------------------------------------------------------------------------------------------*/

export const progressLabelStyles = css({
  position: "absolute",
  top: "50%",
  left: "50%",

  width: "100%",

  color: "$neutral12",
  lineHeight: "$none",
  fontWeight: "$bold",
  textAlign: "center",

  transform: "translate(-50%, -50%)",
});
