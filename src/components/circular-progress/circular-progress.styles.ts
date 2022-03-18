import { spin } from "@/styled-system/keyframes";
import { css, keyframes } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * CircularProgress - keyframes
 * -----------------------------------------------------------------------------------------------*/

export const growAndShrink = keyframes({
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
 * CircularProgress - track
 * -----------------------------------------------------------------------------------------------*/

export const circularProgressTrackStyles = css({
  fill: "transparent",
  stroke: "currentColor",
});

/* -------------------------------------------------------------------------------------------------
 * CircularProgress - svg container for indicator
 * -----------------------------------------------------------------------------------------------*/

export const circularProgressIndicatorContainerStyles = css({
  position: "absolute",
  top: 0,
  left: 0,

  variants: {
    spin: {
      true: {
        animation: `${spin} 2s linear infinite`,
      },
    },
  },
});

/* -------------------------------------------------------------------------------------------------
 * CircularProgress - indicator
 * -----------------------------------------------------------------------------------------------*/

export const circularProgressIndicatorStyles = css({
  fill: "transparent",
  stroke: "currentColor",

  variants: {
    withRoundCaps: {
      true: { strokeLinecap: "round" },
    },
    indeterminate: {
      true: {
        animation: `${growAndShrink} 2s linear infinite`,
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
