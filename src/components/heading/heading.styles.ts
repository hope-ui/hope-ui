import { VariantProps } from "@stitches/core";

import { createStyles } from "@/styled-system/stitches.config";

import { textStyles } from "../text/text.styles";

export const headingStyles = createStyles(textStyles, {
  fontWeight: "$semibold",
});

export type HeadingVariants = VariantProps<typeof headingStyles>;
