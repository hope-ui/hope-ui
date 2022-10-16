import { createStyleConfig, StyleConfigCompoundVariant, StyleConfigProps } from "@hope-ui/styles";

import { INPUT_DEFAULT_VARIANTS, INPUT_SIZES, InputVariants } from "./input.styles";

export type InputGroupParts =
  | "root"
  | "input"
  | "section"
  | "leftSection"
  | "rightSection"
  | "addon"
  | "leftAddon"
  | "rightAddon";

interface InputGroupVariants extends InputVariants {
  /** Whether the input has a left section. */
  hasLeftSection: boolean;

  /** Whether the input has a right section. */
  hasRightSection: boolean;

  /** Whether the input has a left addon. */
  hasLeftAddon: boolean;

  /** Whether the input has a right addon. */
  hasRightAddon: boolean;
}

interface SizeCompoundVariantConfig {
  size: InputGroupVariants["size"];
  paddingWithSection: string | number;
}

function createSizeCompoundVariant(
  config: SizeCompoundVariantConfig
): StyleConfigCompoundVariant<InputGroupVariants>[] {
  return [
    {
      variants: {
        size: config.size,
        hasLeftSection: true,
      },
      style: {
        paddingInlineStart: config.paddingWithSection,
      },
    },
    {
      variants: {
        size: config.size,
        hasRightSection: true,
      },
      style: {
        paddingInlineEnd: config.paddingWithSection,
      },
    },
  ];
}

export const useInputGroupStyleConfig = createStyleConfig<InputGroupParts, InputGroupVariants>(
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
        "&:focus": {
          zIndex: 1,
        },
      },
      variants: {
        hasLeftAddon: {
          true: {
            borderLeftRadius: 0,
          },
        },
        hasRightAddon: {
          true: {
            borderRightRadius: 0,
          },
        },
      },
      compoundVariants: [
        ...createSizeCompoundVariant({
          size: "sm",
          paddingWithSection: 8,
        }),
        ...createSizeCompoundVariant({
          size: "md",
          paddingWithSection: 10,
        }),
        ...createSizeCompoundVariant({
          size: "lg",
          paddingWithSection: 12,
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

        "&[data-disabled]": {
          opacity: 0.4,
          cursor: "not-allowed",
        },
      },
      variants: {
        size: {
          sm: {
            ...INPUT_SIZES.sm,
            height: "100%",
            width: INPUT_SIZES.sm.minHeight,
          },
          md: {
            ...INPUT_SIZES.md,
            height: "100%",
            width: INPUT_SIZES.md.minHeight,
          },
          lg: {
            ...INPUT_SIZES.lg,
            height: "100%",
            width: INPUT_SIZES.lg.minHeight,
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

        "&[data-disabled]": {
          opacity: 0.4,
          cursor: "not-allowed",
        },
      },
      variants: {
        variant: {
          filled: {
            borderRadius: "sm",
            border: "1px solid transparent",
            backgroundColor: "neutral.100",
            color: "neutral.600",
          },
          outlined: {
            borderRadius: "sm",
            border: `1px solid ${vars.colors.neutral["300"]}`,
            backgroundColor: "neutral.100",
            color: "neutral.600",
          },
          plain: {
            border: "1px solid transparent",
            backgroundColor: "transparent",
          },
        },
        size: {
          sm: {
            ...INPUT_SIZES.sm,
            px: 2.5,
          },
          md: {
            ...INPUT_SIZES.md,
            px: 3,
          },
          lg: {
            ...INPUT_SIZES.lg,
            px: 4,
          },
        },
      },
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
  INPUT_DEFAULT_VARIANTS
);

export type InputGroupStyleConfigProps = StyleConfigProps<typeof useInputGroupStyleConfig>;

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
    hasRequiredIndicator: {
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
