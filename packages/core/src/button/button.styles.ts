import {
  CompoundVariant,
  createStyleConfig,
  focusStyles,
  spin,
  StyleConfigProps,
  ThemeColorScheme,
  ThemeVars,
} from "@hope-ui/styles";

export type ButtonParts =
  | "root"
  | "icon"
  | "leftIcon"
  | "rightIcon"
  | "loaderWrapper"
  | "loaderIcon";

interface ButtonVariants {
  /** The color of the button. */
  colorScheme: ThemeColorScheme;

  /** The visual style of the button. */
  variant: "solid" | "soft" | "outlined" | "plain";

  /** The size of the button. */
  size: "xs" | "sm" | "md" | "lg";

  /** Whether the button should take all available width. */
  isFullWidth: boolean;
}

function getColorSchemeCompoundVariants(vars: ThemeVars) {
  const variants: Array<ButtonVariants["variant"]> = ["solid", "soft", "outlined", "plain"];
  const colorSchemes: Array<ButtonVariants["colorScheme"]> = [
    "primary",
    "neutral",
    "success",
    "info",
    "warning",
    "danger",
  ];

  const compoundVariants: Array<CompoundVariant<ButtonParts, ButtonVariants>> = [];

  for (const variant of variants) {
    for (const colorScheme of colorSchemes) {
      compoundVariants.push({
        variants: {
          variant,
          colorScheme,
        },
        styles: {
          root: {
            color: vars.colors[colorScheme][`${variant}Text`],
            bg: vars.colors[colorScheme][`${variant}Bg`],
            borderColor: vars.colors[colorScheme][`${variant}Border`],

            _hover: {
              color: vars.colors[colorScheme][`${variant}HoverText`],
              bg: vars.colors[colorScheme][`${variant}HoverBg`],
              borderColor: vars.colors[colorScheme][`${variant}HoverBorder`],
            },

            _active: {
              color: vars.colors[colorScheme][`${variant}ActiveText`],
              bg: vars.colors[colorScheme][`${variant}ActiveBg`],
              borderColor: vars.colors[colorScheme][`${variant}ActiveBorder`],
            },

            _disabled: {
              color: vars.colors[colorScheme][`${variant}DisabledText`],
              bg: vars.colors[colorScheme][`${variant}DisabledBg`],
              borderColor: vars.colors[colorScheme][`${variant}DisabledBorder`],
            },
          },
        },
      });
    }
  }

  return compoundVariants;
}

export const useStyleConfig = createStyleConfig<ButtonParts, ButtonVariants>(vars => ({
  baseStyles: {
    root: {
      appearance: "none",
      position: "relative",

      justifyContent: "center",
      alignItems: "center",
      gap: 2,

      outline: "none",

      border: "1px solid transparent",
      borderRadius: "sm",

      padding: 0,

      fontFamily: "inherit",
      fontSize: "100%",
      fontWeight: "medium",
      lineHeight: "none",
      textDecoration: "none",

      userSelect: "none",
      whiteSpace: "nowrap",
      verticalAlign: "middle",

      transitionProperty: "color, border-color, background-color, box-shadow",
      transitionDuration: "250ms",

      _disabled: {
        cursor: "not-allowed",
      },

      _loading: {
        opacity: 0.8,
      },

      ...focusStyles(vars),
    },
    icon: {
      display: "inline-flex",
      alignSelf: "center",
      flexShrink: 0,
    },
    leftIcon: {},
    rightIcon: {},
    loaderWrapper: {
      position: "absolute",
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
      fontSize: "1em",
      lineHeight: "normal",
    },
    loaderIcon: {
      fontSize: "1.3em",
      animation: `1s linear infinite ${spin}`,
    },
  },
  variants: {
    colorScheme: {
      primary: {},
      neutral: {},
      success: {},
      info: {},
      warning: {},
      danger: {},
    },
    variant: {
      solid: {},
      soft: {},
      outlined: {},
      plain: {},
    },
    size: {
      xs: {
        root: {
          height: 7,
          px: 3,
          fontSize: "xs",
        },
      },
      sm: {
        root: {
          height: 8,
          px: 4,
          fontSize: "sm",
        },
      },
      md: {
        root: {
          height: 10,
          px: 5,
          fontSize: "base",
        },
      },
      lg: {
        root: {
          height: 12,
          px: 6,
          fontSize: "lg",
        },
      },
    },
    isFullWidth: {
      true: {
        root: {
          display: "flex",
          width: "100%",
        },
      },
      false: {
        root: {
          display: "inline-flex",
          width: "auto",
        },
      },
    },
  },
  compoundVariants: getColorSchemeCompoundVariants(vars),
  defaultVariants: {
    colorScheme: "primary",
    variant: "solid",
    size: "md",
    isFullWidth: false,
    isLoading: false,
  },
}));

export type ButtonStyleConfigProps = StyleConfigProps<typeof useStyleConfig>;
