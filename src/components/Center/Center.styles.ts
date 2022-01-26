import { VariantProps } from "@stitches/core";

import { css } from "@/stitches/stitches.config";

export const centerStyles = css({
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
