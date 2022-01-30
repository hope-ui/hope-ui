import { VariantProps } from "@stitches/core";

import { css } from "@/theme/stitches.config";

import { boxStyles } from "../Box/Box.styles";

export const gridStyles = css(boxStyles, {
  display: "grid",
});

export type GridVariants = VariantProps<typeof gridStyles>;

export const gridItemStyles = css(boxStyles);

export type GridItemVariants = VariantProps<typeof gridItemStyles>;
