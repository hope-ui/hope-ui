import { VariantProps } from "@stitches/core";

import { css } from "@/stitches/stitches.config";

import { textStyles } from "../Text/Text.styles";

export const headingStyles = css(textStyles, {
  defaultVariants: {
    size: "base",
    weight: "semibold",
    color: "dark",
  },
});

export type HeadingVariants = VariantProps<typeof headingStyles>;
