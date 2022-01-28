import { VariantProps } from "@stitches/core";

import { css } from "@/theme/stitches.config";
import { utilityStyles } from "@/theme/utilityStyles";

export const centerStyles = css(utilityStyles, {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export type CenterVariants = VariantProps<typeof centerStyles>;
