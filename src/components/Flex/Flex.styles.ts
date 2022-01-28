import { VariantProps } from "@stitches/core";

import { css } from "@/theme/stitches.config";

import { boxStyles } from "../Box/Box.styles";

export const flexStyles = css(boxStyles, {
  display: "flex",
});

export type FlexVariants = VariantProps<typeof flexStyles>;
