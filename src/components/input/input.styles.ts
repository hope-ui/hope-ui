import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";
import { SystemStyleObject } from "@/styled-system/types";

/* -------------------------------------------------------------------------------------------------
 * CSS reset for text inputs, textarea and select
 * -----------------------------------------------------------------------------------------------*/

export const baseInputResetStyles = css({
  appearance: "none",

  position: "relative",

  width: "100%",
  minWidth: 0,

  outline: "none",

  borderRadius: "$sm",

  backgroundColor: "transparent",

  color: "$neutral12",
  fontSize: "$base",
  lineHeight: "$base",

  transition: "all 250ms",

  _readOnly: {
    userSelect: "all",
  },

  _disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

/* -------------------------------------------------------------------------------------------------
 * Input
 * -----------------------------------------------------------------------------------------------*/

interface InputSizeVariantConfig {
  fontSize: string;
  height: string;
  paddingX: string;
}

function creatInputSizeVariant(config: InputSizeVariantConfig): SystemStyleObject {
  return {
    height: config.height,
    px: config.paddingX,
    fontSize: config.fontSize,
  };
}

export const inputStyles = css(baseInputResetStyles, {
  // TODO: add to textarea too
  _placeholder: {
    color: "$neutral9",
    opacity: 1,
  },

  variants: {
    variant: {
      outline: {
        border: "1px solid $neutral7",
        backgroundColor: "transparent",

        _hover: {
          borderColor: "$neutral8",
        },

        _focus: {
          borderColor: "$primary8",
          boxShadow: "0 0 0 3px $colors$primary5",
        },
      },
      filled: {
        border: "1px solid transparent",
        backgroundColor: "$neutral3",

        _hover: {
          backgroundColor: "$neutral4",
        },

        _focus: {
          boxShadow: "0 0 0 3px $colors$primary5",
          borderColor: "$primary8",
          backgroundColor: "$neutral4",
        },
      },
      unstyled: {
        border: "1px solid transparent",
        backgroundColor: "transparent",
      },
    },
    size: {
      xs: creatInputSizeVariant({
        fontSize: "$xs",
        height: "$6",
        paddingX: "$2",
      }),
      sm: creatInputSizeVariant({
        fontSize: "$sm",
        height: "$8",
        paddingX: "$3",
      }),
      md: creatInputSizeVariant({
        fontSize: "$base",
        height: "$10",
        paddingX: "$4",
      }),
      lg: creatInputSizeVariant({
        fontSize: "$lg",
        height: "$12",
        paddingX: "$4",
      }),
    },
    invalid: {
      true: {
        borderColor: "$danger7",

        _hover: {
          borderColor: "$danger8",
        },

        _focus: {
          boxShadow: "0 0 0 3px $colors$danger5",
          borderColor: "$danger8",
        },
      },
    },
  },
  compoundVariants: [
    {
      variant: "unstyled",
      size: "xs",
      css: {
        px: 0,
        height: "auto",
      },
    },
    {
      variant: "unstyled",
      size: "sm",
      css: {
        px: 0,
        height: "auto",
      },
    },
    {
      variant: "unstyled",
      size: "md",
      css: {
        px: 0,
        height: "auto",
      },
    },
    {
      variant: "unstyled",
      size: "lg",
      css: {
        px: 0,
        height: "auto",
      },
    },
  ],
});

export type InputVariants = VariantProps<typeof inputStyles>;
