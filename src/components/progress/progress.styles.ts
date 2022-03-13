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
 * Progress - track
 * -----------------------------------------------------------------------------------------------*/

export const progressTrackStyles = css({
  position: "relative",
  overflow: "hidden",

  borderRadius: "$sm",
  backgroundColor: "$neutral4",

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

export type ProgressTrackVariants = VariantProps<typeof progressTrackStyles>;

/* -------------------------------------------------------------------------------------------------
 * Progress - filled track
 * -----------------------------------------------------------------------------------------------*/

function createIndeterminateGradient(color: string) {
  return `linear-gradient(to right, transparent 0%, ${color} 50%, transparent 100%)`;
}

export const progressFilledTrackStyles = css({
  position: "relative",
  height: "100%",

  borderRadius: "$sm",

  transitionProperty: "common",
  transitionDuration: "slow",

  variants: {
    colorScheme: {
      primary: {},
      neutral: {},
      success: {},
      info: {},
      warning: {},
      danger: {},
    },
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
    /* -------------------------------------------------------------------------------------------------
     * Varaint - colorScheme + indeterminate
     * -----------------------------------------------------------------------------------------------*/
    {
      colorScheme: "primary",
      indeterminate: true,
      css: { backgroundImage: createIndeterminateGradient("$colors$primary9") },
    },
    {
      colorScheme: "neutral",
      indeterminate: true,
      css: { backgroundImage: createIndeterminateGradient("$colors$neutral9") },
    },
    {
      colorScheme: "success",
      indeterminate: true,
      css: { backgroundImage: createIndeterminateGradient("$colors$success9") },
    },
    {
      colorScheme: "info",
      indeterminate: true,
      css: { backgroundImage: createIndeterminateGradient("$colors$info9") },
    },
    {
      colorScheme: "warning",
      indeterminate: true,
      css: { backgroundImage: createIndeterminateGradient("$colors$warning9") },
    },
    {
      colorScheme: "danger",
      indeterminate: true,
      css: { backgroundImage: createIndeterminateGradient("$colors$danger9") },
    },

    /* -------------------------------------------------------------------------------------------------
     * Varaint - colorScheme + not indeterminate
     * -----------------------------------------------------------------------------------------------*/
    {
      colorScheme: "primary",
      indeterminate: false,
      css: { backgroundColor: "$primary9" },
    },
    {
      colorScheme: "neutral",
      indeterminate: false,
      css: { backgroundColor: "$neutral9" },
    },
    {
      colorScheme: "success",
      indeterminate: false,
      css: { backgroundColor: "$success9" },
    },
    {
      colorScheme: "info",
      indeterminate: false,
      css: { backgroundColor: "$info9" },
    },
    {
      colorScheme: "warning",
      indeterminate: false,
      css: { backgroundColor: "$warning9" },
    },
    {
      colorScheme: "danger",
      indeterminate: false,
      css: { backgroundColor: "$danger9" },
    },

    /* -------------------------------------------------------------------------------------------------
     * Varaint - striped + not indeterminate
     * -----------------------------------------------------------------------------------------------*/
    {
      striped: true,
      indeterminate: false,
      css: {
        backgroundImage:
          "linear-gradient(45deg, $colors$progressStripe 25%, transparent 25%, transparent 50%, $colors$progressStripe 50%,  $colors$progressStripe 75%, transparent 75%, transparent)",
        backgroundSize: "1rem 1rem",
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * Varaint - striped + animated + not indeterminate
     * -----------------------------------------------------------------------------------------------*/
    {
      striped: true,
      animated: true,
      indeterminate: false,
      css: {
        animation: `${stripe} 750ms linear infinite`,
      },
    },
  ],
});

export type ProgressFilledTrackVariants = VariantProps<typeof progressFilledTrackStyles>;

/* -------------------------------------------------------------------------------------------------
 * Progress - label
 * -----------------------------------------------------------------------------------------------*/

export const progressLabelStyles = css({
  position: "absolute",
  top: "50%",
  left: "50%",

  width: "100%",

  color: "$background",
  lineHeight: "$none",
  fontWeight: "$bold",
  textAlign: "center",

  transform: "translate(-50%, -50%)",
});
