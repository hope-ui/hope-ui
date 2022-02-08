import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";

import { baseInputResetStyles } from "../input/input.styles";

interface VariantAndSizeCompoundVariantConfig {
  variant: string;
  size: string;
  paddingX: string | number;
}

function createVariantAndSizeCompoundVariant(config: VariantAndSizeCompoundVariantConfig) {
  return {
    variant: config.variant,
    size: config.size,
    css: { px: config.paddingX },
  };
}

export const textareaStyles = css(baseInputResetStyles, {
  minHeight: "80px",

  py: "$2",

  lineHeight: "$short",

  verticalAlign: "top",

  compoundVariants: [
    /* -------------------------------------------------------------------------------------------------
     * Variant - outline + size
     * -----------------------------------------------------------------------------------------------*/
    createVariantAndSizeCompoundVariant({
      variant: "outline",
      size: "xs",
      paddingX: "$2",
    }),
    createVariantAndSizeCompoundVariant({
      variant: "outline",
      size: "sm",
      paddingX: "$2_5",
    }),
    createVariantAndSizeCompoundVariant({
      variant: "outline",
      size: "md",
      paddingX: "$3",
    }),
    createVariantAndSizeCompoundVariant({
      variant: "outline",
      size: "lg",
      paddingX: "$4",
    }),

    /* -------------------------------------------------------------------------------------------------
     * Variant - filled + size
     * -----------------------------------------------------------------------------------------------*/
    createVariantAndSizeCompoundVariant({
      variant: "filled",
      size: "xs",
      paddingX: "$2",
    }),
    createVariantAndSizeCompoundVariant({
      variant: "filled",
      size: "sm",
      paddingX: "$2_5",
    }),
    createVariantAndSizeCompoundVariant({
      variant: "filled",
      size: "md",
      paddingX: "$3",
    }),
    createVariantAndSizeCompoundVariant({
      variant: "filled",
      size: "lg",
      paddingX: "$4",
    }),

    /* -------------------------------------------------------------------------------------------------
     * Variant - unstyled + size
     * -----------------------------------------------------------------------------------------------*/
    createVariantAndSizeCompoundVariant({
      variant: "unstyled",
      size: "xs",
      paddingX: 0,
    }),
    createVariantAndSizeCompoundVariant({
      variant: "unstyled",
      size: "sm",
      paddingX: 0,
    }),
    createVariantAndSizeCompoundVariant({
      variant: "unstyled",
      size: "md",
      paddingX: 0,
    }),
    createVariantAndSizeCompoundVariant({
      variant: "unstyled",
      size: "lg",
      paddingX: 0,
    }),
  ],
});

export type TextareaVariants = VariantProps<typeof textareaStyles>;
