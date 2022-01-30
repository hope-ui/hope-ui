import { VariantProps } from "@stitches/core";

import { css } from "@/theme/stitches.config";

import { boxStyles } from "../Box/Box.styles";

export const baseFlexStyles = css(boxStyles, {
  display: "flex",
});

export type BaseFlexVariants = VariantProps<typeof baseFlexStyles>;
