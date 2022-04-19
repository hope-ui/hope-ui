import { VariantProps } from "@stitches/core";

import { css } from "../../styled-system/stitches.config";
import { baseInputResetStyles } from "../input/input.styles";

function createVariantAndSizeCompoundVariants(variant: string, paddingX?: string | number) {
  return Object.entries({
    xs: paddingX ?? "$2",
    sm: paddingX ?? "$2_5",
    md: paddingX ?? "$3",
    lg: paddingX ?? "$4",
  }).map(([key, value]) => ({
    variant: variant,
    size: key,
    css: { px: value },
  }));
}

export const textareaStyles = css(baseInputResetStyles, {
  minHeight: "80px",
  py: "$2",

  compoundVariants: [
    ...createVariantAndSizeCompoundVariants("outline"),
    ...createVariantAndSizeCompoundVariants("filled"),
    ...createVariantAndSizeCompoundVariants("unstyled", 0),
  ],
});

export type TextareaVariants = VariantProps<typeof textareaStyles>;
