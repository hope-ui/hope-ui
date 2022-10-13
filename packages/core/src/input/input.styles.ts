import {
  createStyleConfig,
  StyleConfigCompoundVariant,
  StyleConfigProps,
  SystemStyleObject,
  ThemeVars,
} from "@hope-ui/styles";

type InputParts =
  | "root"
  | "input"
  | "section"
  | "leftSection"
  | "rightSection"
  | "addon"
  | "leftAddon"
  | "rightAddon";

interface InputVariants {
  /** The visual style of the input. */
  variant: "filled" | "outlined" | "plain";

  /** The size of the input. */
  size: "sm" | "md" | "lg";

  /** Whether the input has a left section. */
  withLeftSection: boolean;

  /** Whether the input has a right section. */
  withRightSection: boolean;

  /** Whether the input has a left addon. */
  withLeftAddon: boolean;

  /** Whether the input has a right addon. */
  withRightAddon: boolean;
}

const inputSizes: Record<InputVariants["size"], SystemStyleObject> = {
  sm: {
    fontSize: "sm",
    lineHeight: 5,
    minHeight: 8,
  },
  md: {
    fontSize: "base",
    lineHeight: 6,
    minHeight: 10,
  },
  lg: {
    fontSize: "lg",
    lineHeight: 7,
    minHeight: 12,
  },
};

function commonOutlineAndFilledStyles(vars: ThemeVars): SystemStyleObject {
  return {
    "&:disabled": {
      opacity: 0.4,
      cursor: "not-allowed",
    },

    "&:focus": {
      boxShadow: `0 0 0 3px ${vars.colors.primary["300"]}`,
      borderColor: "primary.600",
    },

    "&[aria-invalid=true]": {
      borderColor: "danger.600",
    },

    "&[aria-invalid=true]:focus": {
      boxShadow: `0 0 0 3px ${vars.colors.danger["300"]}`,
    },
  };
}

interface VariantAndSizeCompoundVariantConfig {
  variant: InputVariants["variant"];
  size: InputVariants["size"];
  px: string | number;
  paddingWithElement: string | number;
}

function createVariantAndSizeCompoundVariant(
  config: VariantAndSizeCompoundVariantConfig
): StyleConfigCompoundVariant<InputVariants>[] {
  return [
    {
      variants: {
        variant: config.variant,
        size: config.size,
      },
      style: {
        px: config.px,
      },
    },
    {
      variants: {
        variant: config.variant,
        size: config.size,
        withLeftSection: true,
      },
      style: {
        paddingInlineStart: config.paddingWithElement,
      },
    },
    {
      variants: {
        variant: config.variant,
        size: config.size,
        withRightSection: true,
      },
      style: {
        paddingInlineEnd: config.paddingWithElement,
      },
    },
  ];
}

const useInputStyleConfig = createStyleConfig<InputParts, InputVariants>(
  ({ vars }) => ({
    root: {
      baseStyle: {
        position: "relative",
        display: "flex",
        width: "100%",
      },
    },
    input: {
      baseStyle: {
        appearance: "none",

        position: "relative",
        width: "100%",
        minWidth: 0,

        outline: "none",
        borderRadius: "sm",
        backgroundColor: "transparent",
        padding: 0,

        color: "common.foreground",
        fontSize: "base",
        lineHeight: "base",

        transitionProperty: "color, border-color, background-color, box-shadow 250ms",
        transitionDuration: "250ms",

        "&[readonly]": {
          boxShadow: "none !important",
          userSelect: "all",
          cursor: "default",
        },

        "&::placeholder": {
          color: "neutral.500",
          opacity: 1,
        },
      },
      variants: {
        variant: {
          filled: {
            border: "1px solid transparent",
            backgroundColor: "neutral.100",

            "&:hover, &:focus": {
              backgroundColor: "neutral.200",
            },

            ...commonOutlineAndFilledStyles(vars),
          },
          outlined: {
            border: `1px solid ${vars.colors.neutral["400"]}`,
            backgroundColor: "transparent",

            "&:hover": {
              borderColor: "neutral.500",
            },

            ...commonOutlineAndFilledStyles(vars),
          },
          plain: {
            border: "1px solid transparent",
            backgroundColor: "transparent",
          },
        },
        withLeftAddon: {
          true: {
            borderLeftRadius: 0,
          },
        },
        withRightAddon: {
          true: {
            borderRightRadius: 0,
          },
        },
        size: {
          ...inputSizes,
        },
      },
      compoundVariants: [
        /* -------------------------------------------------------------------------------------------------
         * Variant - filled + size
         * -----------------------------------------------------------------------------------------------*/
        ...createVariantAndSizeCompoundVariant({
          variant: "filled",
          size: "sm",
          px: 2.5,
          paddingWithElement: 8,
        }),
        ...createVariantAndSizeCompoundVariant({
          variant: "filled",
          size: "md",
          px: 3,
          paddingWithElement: 10,
        }),
        ...createVariantAndSizeCompoundVariant({
          variant: "filled",
          size: "lg",
          px: 4,
          paddingWithElement: 12,
        }),

        /* -------------------------------------------------------------------------------------------------
         * Variant - outlined + size
         * -----------------------------------------------------------------------------------------------*/
        ...createVariantAndSizeCompoundVariant({
          variant: "outlined",
          size: "sm",
          px: 2.5,
          paddingWithElement: 8,
        }),
        ...createVariantAndSizeCompoundVariant({
          variant: "outlined",
          size: "md",
          px: 3,
          paddingWithElement: 10,
        }),
        ...createVariantAndSizeCompoundVariant({
          variant: "outlined",
          size: "lg",
          px: 4,
          paddingWithElement: 12,
        }),

        /* -------------------------------------------------------------------------------------------------
         * Variant - plain + size
         * -----------------------------------------------------------------------------------------------*/
        ...createVariantAndSizeCompoundVariant({
          variant: "plain",
          size: "sm",
          px: 0,
          paddingWithElement: 8,
        }),
        ...createVariantAndSizeCompoundVariant({
          variant: "plain",
          size: "md",
          px: 0,
          paddingWithElement: 10,
        }),
        ...createVariantAndSizeCompoundVariant({
          variant: "plain",
          size: "lg",
          px: 0,
          paddingWithElement: 12,
        }),
      ],
    },
    section: {
      baseStyle: {
        position: "absolute",
        top: "0",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      variants: {
        size: {
          sm: {
            ...inputSizes.sm,
            width: inputSizes.sm.minHeight,
          },
          md: {
            ...inputSizes.md,
            width: inputSizes.md.minHeight,
          },
          lg: {
            ...inputSizes.lg,
            width: inputSizes.lg.minHeight,
          },
        },
      },
    },
    leftSection: {
      baseStyle: {
        insetInlineStart: 0,
      },
    },
    rightSection: {
      baseStyle: {
        insetInlineEnd: 0,
      },
    },
    addon: {
      baseStyle: {
        display: "flex",
        alignItems: "center",
        flex: "0 0 auto",
        width: "auto",
        whiteSpace: "nowrap",
      },
      variants: {
        variant: {
          filled: {
            borderRadius: "sm",
            border: "1px solid transparent",
            backgroundColor: "neutral.300",
            color: "common.foreground",
          },
          outlined: {
            borderRadius: "sm",
            border: `1px solid ${vars.colors.neutral["400"]}`,
            backgroundColor: "neutral.300",
            color: "common.foreground",
          },
          plain: {
            border: "1px solid transparent",
            backgroundColor: "transparent",
            px: 0,
          },
        },
        size: {
          ...inputSizes,
        },
      },
      compoundVariants: [
        /* -------------------------------------------------------------------------------------------------
         * Variant - filled + size
         * -----------------------------------------------------------------------------------------------*/
        {
          variants: {
            variant: "filled",
            size: "sm",
          },
          style: {
            px: 2.5,
          },
        },
        {
          variants: {
            variant: "filled",
            size: "md",
          },
          style: {
            px: 3,
          },
        },
        {
          variants: {
            variant: "filled",
            size: "lg",
          },
          style: {
            px: 4,
          },
        },

        /* -------------------------------------------------------------------------------------------------
         * Variant - outlined + size
         * -----------------------------------------------------------------------------------------------*/
        {
          variants: {
            variant: "outlined",
            size: "sm",
          },
          style: {
            px: 2.5,
          },
        },
        {
          variants: {
            variant: "outlined",
            size: "md",
          },
          style: {
            px: 3,
          },
        },
        {
          variants: {
            variant: "outlined",
            size: "lg",
          },
          style: {
            px: 4,
          },
        },
      ],
    },
    leftAddon: {
      baseStyle: {
        marginEnd: "-1px",
      },
      variants: {
        variant: {
          filled: {
            borderStartEndRadius: 0,
            borderEndEndRadius: 0,
            borderInlineEndColor: "transparent",
          },
          outlined: {
            borderRightRadius: 0,
            borderInlineEndColor: "transparent",
          },
        },
      },
    },
    rightAddon: {
      baseStyle: {
        marginStart: "-1px",
      },
      variants: {
        variant: {
          filled: {
            borderStartStartRadius: 0,
            borderEndStartRadius: 0,
            borderInlineStartColor: "transparent",
          },
          outlined: {
            borderLeftRadius: 0,
            borderInlineStartColor: "transparent",
          },
        },
      },
    },
  }),
  {
    size: "md",
  }
);

export type InputStyleConfigProps = StyleConfigProps<typeof useInputStyleConfig>;

/*

<root>
  <leftAddon />
  <leftElement />
  <input />
  <rightElement />
  <rightAddon />
</root>

<root>
  <label />
  <inputGroup />
  <description />
  <error />
</root>

*/

/*

const baseDescriptionStyles: SystemStyleObject = {
  display: "inline-block",
  fontWeight: "normal",
  fontSize: "xs",
  lineHeight: 4,
  textAlign: "start",
  wordBreak: "break-word",
};

//

label: {
  baseStyle: {
    display: "inline-block",
    color: "common.foreground",
    WebkitTapHighlightColor: "transparent",
    fontWeight: "medium",
    fontSize: "sm",
    lineHeight: 5,
    textAlign: "start",
    wordBreak: "break-word",
  },
  variants: {
    withRequiredIndicator: {
      true: {
        _after: {
          content: `"*"`,
          marginInlineStart: 1,
          color: { light: "danger.600", dark: "danger.500" },
          fontSize: "base",
        },
      },
    },
  },
},
description: {
  baseStyle: {
    ...baseDescriptionStyles,
    color: { light: "neutral.600", dark: "neutral.500" },
  },
},
error: {
  baseStyle: {
    ...baseDescriptionStyles,
    color: { light: "danger.600", dark: "danger.500" },
  },
},

*/
