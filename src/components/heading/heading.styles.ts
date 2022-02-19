import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";

import { textStyles } from "../text/text.styles";

export const headingStyles = css(textStyles, {
  fontWeight: "$semibold",
});

export type HeadingVariants = VariantProps<typeof headingStyles>;
