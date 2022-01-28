import { VariantProps } from "@stitches/core";

import { css } from "@/theme/stitches.config";

import { boxStyles } from "../Box/Box.styles";

export const centerStyles = css(boxStyles, {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export type CenterVariants = VariantProps<typeof centerStyles>;
