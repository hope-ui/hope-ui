import { VariantProps } from "@stitches/core";

import { css } from "@/theme/stitches.config";

import { boxStyles } from "../Box/Box.styles";

export const stackStyles = css(boxStyles, {
  display: "flex",
});

export type StackVariants = VariantProps<typeof stackStyles>;
