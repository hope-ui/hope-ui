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
    boxShadow: "none !important",
    userSelect: "all",
    cursor: "default",
  },
});

/* -------------------------------------------------------------------------------------------------
 * Input
 * -----------------------------------------------------------------------------------------------*/

interface InputSizeVariantConfig {
  fontSize: string;
  lineHeight: string;
  height: string;
  paddingX: string;
}

function creatInputSizeVariant(config: InputSizeVariantConfig): SystemStyleObject {
  return {
    height: config.height,
    px: config.paddingX,
    fontSize: config.fontSize,
    lineHeight: config.lineHeight,
  };
}

export const inputStyles = css(baseInputResetStyles, {
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

        _disabled: {
          opacity: 0.4,
          cursor: "not-allowed",
        },

        _invalid: {
          borderColor: "$danger7",
        },

        [`&[aria-invalid=true]:hover, &[data-invalid]:hover,
          &[aria-invalid=true]:focus, &[data-invalid]:focus`]: {
          borderColor: "$danger8",
        },

        "&[aria-invalid=true]:focus, &[data-invalid]:focus": {
          boxShadow: "0 0 0 3px $colors$danger5",
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

        _disabled: {
          opacity: 0.4,
          cursor: "not-allowed",
        },

        _invalid: {
          borderColor: "$danger7",
        },

        [`&[aria-invalid=true]:hover, &[data-invalid]:hover,
          &[aria-invalid=true]:focus, &[data-invalid]:focus`]: {
          borderColor: "$danger8",
        },

        "&[aria-invalid=true]:focus, &[data-invalid]:focus": {
          boxShadow: "0 0 0 3px $colors$danger5",
        },
      },
      flushed: {
        borderBottom: "1px solid $neutral7",
        borderRadius: 0,
        backgroundColor: "transparent",
        px: "$px",

        _hover: {
          borderColor: "$neutral8",
        },

        _focus: {
          borderColor: "$primary9",
          boxShadow: "0 1px 0 0 $colors$primary9",
        },

        _disabled: {
          opacity: 0.4,
          cursor: "not-allowed",
        },

        _invalid: {
          borderColor: "$danger8",
        },

        [`&[aria-invalid=true]:hover, &[data-invalid]:hover,
          &[aria-invalid=true]:focus, &[data-invalid]:focus`]: {
          borderColor: "$danger9",
        },

        "&[aria-invalid=true]:focus, &[data-invalid]:focus": {
          boxShadow: "0 1px 0 $colors$danger9",
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
        lineHeight: "$4",
        height: "$6",
        paddingX: "$2",
      }),
      sm: creatInputSizeVariant({
        fontSize: "$sm",
        lineHeight: "$5",
        height: "$8",
        paddingX: "$2_5",
      }),
      md: creatInputSizeVariant({
        fontSize: "$base",
        lineHeight: "$6",
        height: "$10",
        paddingX: "$3",
      }),
      lg: creatInputSizeVariant({
        fontSize: "$lg",
        lineHeight: "$7",
        height: "$12",
        paddingX: "$4",
      }),
    },
    withLeftElement: {
      true: {},
    },
    withRightElement: {
      true: {},
    },
  },
  compoundVariants: [
    /* -------------------------------------------------------------------------------------------------
     * Variant - unstyled + size
     * -----------------------------------------------------------------------------------------------*/
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

    /* -------------------------------------------------------------------------------------------------
     * With left element + size
     * -----------------------------------------------------------------------------------------------*/
    {
      withLeftElement: true,
      size: "xs",
      css: {
        paddingInlineStart: "$6",
      },
    },
    {
      withLeftElement: true,
      size: "sm",
      css: {
        paddingInlineStart: "$8",
      },
    },
    {
      withLeftElement: true,
      size: "md",
      css: {
        paddingInlineStart: "$10",
      },
    },
    {
      withLeftElement: true,
      size: "lg",
      css: {
        paddingInlineStart: "$12",
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * With right element + size
     * -----------------------------------------------------------------------------------------------*/
    {
      withRightElement: true,
      size: "xs",
      css: {
        paddingInlineEnd: "$6",
      },
    },
    {
      withRightElement: true,
      size: "sm",
      css: {
        paddingInlineEnd: "$8",
      },
    },
    {
      withRightElement: true,
      size: "md",
      css: {
        paddingInlineEnd: "$10",
      },
    },
    {
      withRightElement: true,
      size: "lg",
      css: {
        paddingInlineEnd: "$12",
      },
    },
  ],
});

export type InputVariants = VariantProps<typeof inputStyles>;

/* -------------------------------------------------------------------------------------------------
 * InputGroup
 * -----------------------------------------------------------------------------------------------*/

export const inputGroupStyles = css({
  position: "relative",
  display: "flex",
  width: "100%",
});

/* -------------------------------------------------------------------------------------------------
 * InputAddon
 * -----------------------------------------------------------------------------------------------*/

export const inputAddonStyles = css({});

/* -------------------------------------------------------------------------------------------------
 * InputElement
 * -----------------------------------------------------------------------------------------------*/

interface InputElementSizeVariantConfig {
  fontSize: string;
  lineHeight: string;
  size: string;
}

function creatInputElementSizeVariant(config: InputElementSizeVariantConfig): SystemStyleObject {
  return {
    boxSize: config.size,
    fontSize: config.fontSize,
    lineHeight: config.lineHeight,
  };
}

export const inputElementStyles = css({
  position: "absolute",
  top: "0",

  zIndex: 2,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  variants: {
    placement: {
      left: {
        insetInlineStart: "0",
      },
      right: {
        insetInlineEnd: "0",
      },
    },
    size: {
      xs: creatInputElementSizeVariant({
        fontSize: "$xs",
        lineHeight: "$4",
        size: "$6",
      }),
      sm: creatInputElementSizeVariant({
        fontSize: "$sm",
        lineHeight: "$5",
        size: "$8",
      }),
      md: creatInputElementSizeVariant({
        fontSize: "$base",
        lineHeight: "$6",
        size: "$10",
      }),
      lg: creatInputElementSizeVariant({
        fontSize: "$lg",
        lineHeight: "$7",
        size: "$12",
      }),
    },
  },
});

export type InputElementVariants = VariantProps<typeof inputElementStyles>;
