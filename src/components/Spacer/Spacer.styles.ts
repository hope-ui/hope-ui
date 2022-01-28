import { css, VariantProps } from "@stitches/core";

import { boxStyles } from "../Box/Box.styles";

export const spacerStyles = css(boxStyles, {
  flex: 1,
  justifySelf: "stretch",
  alignSelf: "stretch",
});

export type SpacerVariants = VariantProps<typeof spacerStyles>;
