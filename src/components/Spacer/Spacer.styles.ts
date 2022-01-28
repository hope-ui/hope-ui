import { css, VariantProps } from "@stitches/core";

import { utilityStyles } from "@/theme/utilityStyles";

export const spacerStyles = css(utilityStyles, {
  flex: 1,
  justifySelf: "stretch",
  alignSelf: "stretch",
});

export type SpacerVariants = VariantProps<typeof spacerStyles>;
