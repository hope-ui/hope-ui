import { VariantProps } from "@stitches/core";

import { spin } from "@/styled-system/keyframes";
import { css, keyframes } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * CircularProgress - keyframes
 * -----------------------------------------------------------------------------------------------*/

export const circularProgressSpin = keyframes({
  "0%": {
    strokeDasharray: "1, 400",
    strokeDashoffset: "0",
  },
  "50%": {
    strokeDasharray: "400, 400",
    strokeDashoffset: "-100",
  },
  "100%": {
    strokeDasharray: "400, 400",
    strokeDashoffset: "-260",
  },
});

/* -------------------------------------------------------------------------------------------------
 * CircularProgress
 * -----------------------------------------------------------------------------------------------*/

export const circularProgressStyles = css({
  position: "relative",

  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",

  verticalAlign: "middle",
});

/* -------------------------------------------------------------------------------------------------
 * CircularProgress - svg container
 * -----------------------------------------------------------------------------------------------*/

export const circularProgressSvgStyles = css({
  variants: {
    spin: {
      true: {
        animation: `${spin} 2s linear infinite`,
      },
    },
  },
});

/* -------------------------------------------------------------------------------------------------
 * CircularProgress - track
 * -----------------------------------------------------------------------------------------------*/

export const circularProgressTrackStyles = css({});

/* -------------------------------------------------------------------------------------------------
 * CircularProgress - indicator
 * -----------------------------------------------------------------------------------------------*/

export const circularProgressIndicatorStyles = css({
  variants: {
    withRoundCap: {
      true: { strokeLinecap: "round" },
    },
    spin: {
      true: {
        animation: `${circularProgressSpin} 2s linear infinite`,
      },
      false: {
        strokeDashoffset: 66,
        transitionProperty: "stroke-dasharray, stroke",
        transitionDuration: "0.6s",
        transitionTimingFunction: "ease",
      },
    },
  },
});

export type CircleProgressIndicatorVariants = VariantProps<typeof circularProgressIndicatorStyles>;

/* -------------------------------------------------------------------------------------------------
 * CircularProgress - label
 * -----------------------------------------------------------------------------------------------*/

export const circularProgressLabelStyles = css({
  position: "absolute",
  top: "50%",
  left: "50%",

  width: "100%",

  color: "$neutral12",
  fontSize: "$xs",
  lineHeight: "$none",
  fontWeight: "$bold",
  textAlign: "center",

  transform: "translate(-50%, -50%)",
});
