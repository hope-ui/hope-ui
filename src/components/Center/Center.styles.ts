import { VariantProps } from "@stitches/core";

import { css } from "@/theme/stitches.config";
import { utilityStyles } from "@/theme/utilityStyles";

export const centerStyles = css(utilityStyles, {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  variants: {
    fullWidth: {
      true: { width: "$full" },
    },
    fullHeight: {
      true: { height: "$full" },
    },
    fullSize: {
      true: { boxSize: "$full" },
    },
  },
});

export type CenterVariants = VariantProps<typeof centerStyles>;
