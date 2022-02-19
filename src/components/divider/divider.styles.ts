import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";

export const dividerStyles = css({
  border: 0,
  borderColor: "currentColor",

  variants: {
    variant: {
      solid: {
        borderStyle: "solid",
      },
      dashed: {
        borderStyle: "dashed",
      },
      dotted: {
        borderStyle: "dotted",
      },
    },
    orientation: {
      vertical: {
        height: "100%",
      },
      horizontal: {
        width: "100%",
      },
    },
  },
});

export type DividerVariants = VariantProps<typeof dividerStyles>;
