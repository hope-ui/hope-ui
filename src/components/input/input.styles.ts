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

  padding: 0,

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
}

function createInputSizeVariant(config: InputSizeVariantConfig): SystemStyleObject {
  return {
    height: config.height,
    fontSize: config.fontSize,
    lineHeight: config.lineHeight,
  };
}

const inputSizes = {
  xs: createInputSizeVariant({ fontSize: "$xs", lineHeight: "$4", height: "$6" }),
  sm: createInputSizeVariant({ fontSize: "$sm", lineHeight: "$5", height: "$8" }),
  md: createInputSizeVariant({ fontSize: "$base", lineHeight: "$6", height: "$10" }),
  lg: createInputSizeVariant({ fontSize: "$lg", lineHeight: "$7", height: "$12" }),
};

interface VariantAndSizeCompoundVariantConfig {
  variant: string;
  size: string;
  paddingX: string | number;
  paddingWithElement: string | number;
}

function createVariantAndSizeCompoundVariant(config: VariantAndSizeCompoundVariantConfig) {
  return [
    {
      variant: config.variant,
      size: config.size,
      css: { px: config.paddingX },
    },
    {
      withLeftElement: true,
      variant: config.variant,
      size: config.size,
      css: { paddingInlineStart: config.paddingWithElement },
    },
    {
      withRightElement: true,
      variant: config.variant,
      size: config.size,
      css: { paddingInlineEnd: config.paddingWithElement },
    },
  ];
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
      unstyled: {
        border: "1px solid transparent",
        backgroundColor: "transparent",
      },
    },
    size: {
      ...inputSizes,
    },
    withLeftElement: {
      true: {},
    },
    withRightElement: {
      true: {},
    },
    withLeftAddon: {
      true: {
        borderStartStartRadius: 0,
        borderEndStartRadius: 0,
      },
    },
    withRightAddon: {
      true: {
        borderStartEndRadius: 0,
        borderEndEndRadius: 0,
      },
    },
  },
  compoundVariants: [
    /* -------------------------------------------------------------------------------------------------
     * Variant - outline + size
     * -----------------------------------------------------------------------------------------------*/
    ...createVariantAndSizeCompoundVariant({
      variant: "outline",
      size: "xs",
      paddingX: "$2",
      paddingWithElement: "$6",
    }),
    ...createVariantAndSizeCompoundVariant({
      variant: "outline",
      size: "sm",
      paddingX: "$2_5",
      paddingWithElement: "$8",
    }),
    ...createVariantAndSizeCompoundVariant({
      variant: "outline",
      size: "md",
      paddingX: "$3",
      paddingWithElement: "$10",
    }),
    ...createVariantAndSizeCompoundVariant({
      variant: "outline",
      size: "lg",
      paddingX: "$4",
      paddingWithElement: "$12",
    }),

    /* -------------------------------------------------------------------------------------------------
     * Variant - filled + size
     * -----------------------------------------------------------------------------------------------*/
    ...createVariantAndSizeCompoundVariant({
      variant: "filled",
      size: "xs",
      paddingX: "$2",
      paddingWithElement: "$6",
    }),
    ...createVariantAndSizeCompoundVariant({
      variant: "filled",
      size: "sm",
      paddingX: "$2_5",
      paddingWithElement: "$8",
    }),
    ...createVariantAndSizeCompoundVariant({
      variant: "filled",
      size: "md",
      paddingX: "$3",
      paddingWithElement: "$10",
    }),
    ...createVariantAndSizeCompoundVariant({
      variant: "filled",
      size: "lg",
      paddingX: "$4",
      paddingWithElement: "$12",
    }),

    /* -------------------------------------------------------------------------------------------------
     * Variant - unstyled + size
     * -----------------------------------------------------------------------------------------------*/
    ...createVariantAndSizeCompoundVariant({
      variant: "unstyled",
      size: "xs",
      paddingX: 0,
      paddingWithElement: "$6",
    }),
    ...createVariantAndSizeCompoundVariant({
      variant: "unstyled",
      size: "sm",
      paddingX: 0,
      paddingWithElement: "$8",
    }),
    ...createVariantAndSizeCompoundVariant({
      variant: "unstyled",
      size: "md",
      paddingX: 0,
      paddingWithElement: "$10",
    }),
    ...createVariantAndSizeCompoundVariant({
      variant: "unstyled",
      size: "lg",
      paddingX: 0,
      paddingWithElement: "$12",
    }),
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
 * InputElement
 * -----------------------------------------------------------------------------------------------*/

export const inputElementStyles = css({
  position: "absolute",
  top: "0",

  zIndex: 2,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  variants: {
    placement: {
      left: { insetInlineStart: "0" },
      right: { insetInlineEnd: "0" },
    },
    size: {
      xs: {
        ...inputSizes.xs,
        width: inputSizes.xs.height,
      },
      sm: {
        ...inputSizes.sm,
        width: inputSizes.sm.height,
      },
      md: {
        ...inputSizes.md,
        width: inputSizes.md.height,
      },
      lg: {
        ...inputSizes.lg,
        width: inputSizes.lg.height,
      },
    },
  },
});

export type InputElementVariants = VariantProps<typeof inputElementStyles>;

/* -------------------------------------------------------------------------------------------------
 * InputAddon
 * -----------------------------------------------------------------------------------------------*/

interface InputAddonVariantAndSizeCompoundVariantConfig {
  variant: string;
  size: string;
  paddingX: string | number;
}

function createInputAddonVariantAndSizeCompoundVariant(
  config: InputAddonVariantAndSizeCompoundVariantConfig
) {
  return {
    variant: config.variant,
    size: config.size,
    css: { px: config.paddingX },
  };
}

export const inputAddonStyles = css({
  display: "flex",
  alignItems: "center",
  flex: "0 0 auto",

  width: "auto",

  whiteSpace: "nowrap",

  variants: {
    placement: {
      left: {
        marginEnd: "-1px",
      },
      right: {
        marginStart: "-1px",
      },
    },
    variant: {
      outline: {
        borderRadius: "$sm",
        border: "1px solid $neutral7",
        backgroundColor: "$neutral3",
        color: "$neutral12",
      },
      filled: {
        borderRadius: "$sm",
        border: "1px solid transparent",
        backgroundColor: "$neutral3",
        color: "$neutral12",
      },
      unstyled: {
        border: "1px solid transparent",
        backgroundColor: "transparent",
      },
    },
    size: {
      ...inputSizes,
    },
  },
  compoundVariants: [
    /* -------------------------------------------------------------------------------------------------
     * Variant - outline + placement
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "outline",
      placement: "left",
      css: {
        borderStartEndRadius: 0,
        borderEndEndRadius: 0,
        borderInlineEndColor: "transparent",
      },
    },
    {
      variant: "outline",
      placement: "right",
      css: {
        borderStartStartRadius: 0,
        borderEndStartRadius: 0,
        borderInlineStartColor: "transparent",
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - filled + placement
     * -----------------------------------------------------------------------------------------------*/
    {
      variant: "filled",
      placement: "left",
      css: {
        borderStartEndRadius: 0,
        borderEndEndRadius: 0,
        borderInlineEndColor: "transparent",
      },
    },
    {
      variant: "filled",
      placement: "right",
      css: {
        borderStartStartRadius: 0,
        borderEndStartRadius: 0,
        borderInlineStartColor: "transparent",
      },
    },

    /* -------------------------------------------------------------------------------------------------
     * Variant - outline + size
     * -----------------------------------------------------------------------------------------------*/
    createInputAddonVariantAndSizeCompoundVariant({
      variant: "outline",
      size: "xs",
      paddingX: "$2",
    }),
    createInputAddonVariantAndSizeCompoundVariant({
      variant: "outline",
      size: "sm",
      paddingX: "$2_5",
    }),
    createInputAddonVariantAndSizeCompoundVariant({
      variant: "outline",
      size: "md",
      paddingX: "$3",
    }),
    createInputAddonVariantAndSizeCompoundVariant({
      variant: "outline",
      size: "lg",
      paddingX: "$4",
    }),

    /* -------------------------------------------------------------------------------------------------
     * Variant - filled + size
     * -----------------------------------------------------------------------------------------------*/
    createInputAddonVariantAndSizeCompoundVariant({
      variant: "filled",
      size: "xs",
      paddingX: "$2",
    }),
    createInputAddonVariantAndSizeCompoundVariant({
      variant: "filled",
      size: "sm",
      paddingX: "$2_5",
    }),
    createInputAddonVariantAndSizeCompoundVariant({
      variant: "filled",
      size: "md",
      paddingX: "$3",
    }),
    createInputAddonVariantAndSizeCompoundVariant({
      variant: "filled",
      size: "lg",
      paddingX: "$4",
    }),

    /* -------------------------------------------------------------------------------------------------
     * Variant - unstyled + size
     * -----------------------------------------------------------------------------------------------*/
    createInputAddonVariantAndSizeCompoundVariant({
      variant: "unstyled",
      size: "xs",
      paddingX: 0,
    }),
    createInputAddonVariantAndSizeCompoundVariant({
      variant: "unstyled",
      size: "sm",
      paddingX: 0,
    }),
    createInputAddonVariantAndSizeCompoundVariant({
      variant: "unstyled",
      size: "md",
      paddingX: 0,
    }),
    createInputAddonVariantAndSizeCompoundVariant({
      variant: "unstyled",
      size: "lg",
      paddingX: 0,
    }),
  ],
});

export type InputAddonVariants = VariantProps<typeof inputAddonStyles>;
