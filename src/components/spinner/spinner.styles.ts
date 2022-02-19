import { VariantProps } from "@stitches/core";

import { spin } from "@/styled-system/keyframes";
import { css } from "@/styled-system/stitches.config";

export const spinnerStyles = css({
  display: "inline-block",

  borderColor: "currentColor",
  borderStyle: "solid",
  borderRadius: "$full",
  borderWidth: "2px",
  borderBottomColor: "transparent",
  borderLeftColor: "transparent",

  animationName: `${spin}`,
  animationDuration: "0.45s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",

  variants: {
    size: {
      xs: {
        boxSize: "0.75rem",
      },
      sm: {
        boxSize: "1rem",
      },
      md: {
        boxSize: "1.5rem",
      },
      lg: {
        boxSize: "2rem",
      },
      xl: {
        boxSize: "3rem",
      },
    },
  },
});

export type SpinnerVariants = VariantProps<typeof spinnerStyles>;
