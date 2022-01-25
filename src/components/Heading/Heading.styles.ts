import { VariantProps } from "@stitches/core";

import { css } from "@/stitches/stitches.config";

import { textStyles } from "../Text/Text.styles";

export const headingStyles = css(textStyles, {
  defaultVariants: {
    weight: "semibold",
  },
});

export type HeadingVariants = VariantProps<typeof headingStyles>;
