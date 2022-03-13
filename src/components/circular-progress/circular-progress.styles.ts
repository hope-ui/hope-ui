import { VariantProps } from "@stitches/core";

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

export const circularProgressStyles = css({});
