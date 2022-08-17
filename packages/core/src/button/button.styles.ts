import { createStyleConfig, focusStyles, spin, StyleConfigProps } from "@hope-ui/styles";

export type ButtonParts =
  | "root"
  | "icon"
  | "leftIcon"
  | "rightIcon"
  | "loaderWrapper"
  | "loaderIcon";

interface ButtonVariants {
  /** The visual style of the button. */
  variant: "solid" | "soft" | "outlined" | "plain";

  /** The size of the button. */
  size: "xs" | "sm" | "md" | "lg";

  /** Whether the button should take all available width. */
  isFullWidth: boolean;
}

export const useStyleConfig = createStyleConfig<ButtonParts, ButtonVariants>(
  ({ vars, colorScheme }) => ({
    baseStyle: {
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
      variant: {
        solid: {
          root: {
            color: vars.colors[colorScheme].solidText,
            bg: vars.colors[colorScheme].solidBg,
            borderColor: vars.colors[colorScheme].solidBorder,

            _hover: {
              color: vars.colors[colorScheme].solidHoverText,
              bg: vars.colors[colorScheme].solidHoverBg,
              borderColor: vars.colors[colorScheme].solidHoverBorder,
            },

            _active: {
              color: vars.colors[colorScheme].solidActiveText,
              bg: vars.colors[colorScheme].solidActiveBg,
              borderColor: vars.colors[colorScheme].solidActiveBorder,
            },

            _disabled: {
              color: vars.colors[colorScheme].solidDisabledText,
              bg: vars.colors[colorScheme].solidDisabledBg,
              borderColor: vars.colors[colorScheme].solidDisabledBorder,
            },
          },
        },
        soft: {
          root: {
            color: vars.colors[colorScheme].softText,
            bg: vars.colors[colorScheme].softBg,
            borderColor: vars.colors[colorScheme].softBorder,

            _hover: {
              color: vars.colors[colorScheme].softHoverText,
              bg: vars.colors[colorScheme].softHoverBg,
              borderColor: vars.colors[colorScheme].softHoverBorder,
            },

            _active: {
              color: vars.colors[colorScheme].softActiveText,
              bg: vars.colors[colorScheme].softActiveBg,
              borderColor: vars.colors[colorScheme].softActiveBorder,
            },

            _disabled: {
              color: vars.colors[colorScheme].softDisabledText,
              bg: vars.colors[colorScheme].softDisabledBg,
              borderColor: vars.colors[colorScheme].softDisabledBorder,
            },
          },
        },
        outlined: {
          root: {
            color: vars.colors[colorScheme].outlinedText,
            bg: vars.colors[colorScheme].outlinedBg,
            borderColor: vars.colors[colorScheme].outlinedBorder,

            _hover: {
              color: vars.colors[colorScheme].outlinedHoverText,
              bg: vars.colors[colorScheme].outlinedHoverBg,
              borderColor: vars.colors[colorScheme].outlinedHoverBorder,
            },

            _active: {
              color: vars.colors[colorScheme].outlinedActiveText,
              bg: vars.colors[colorScheme].outlinedActiveBg,
              borderColor: vars.colors[colorScheme].outlinedActiveBorder,
            },

            _disabled: {
              color: vars.colors[colorScheme].outlinedDisabledText,
              bg: vars.colors[colorScheme].outlinedDisabledBg,
              borderColor: vars.colors[colorScheme].outlinedDisabledBorder,
            },
          },
        },
        plain: {
          root: {
            color: vars.colors[colorScheme].plainText,
            bg: vars.colors[colorScheme].plainBg,
            borderColor: vars.colors[colorScheme].plainBorder,

            _hover: {
              color: vars.colors[colorScheme].plainHoverText,
              bg: vars.colors[colorScheme].plainHoverBg,
              borderColor: vars.colors[colorScheme].plainHoverBorder,
            },

            _active: {
              color: vars.colors[colorScheme].plainActiveText,
              bg: vars.colors[colorScheme].plainActiveBg,
              borderColor: vars.colors[colorScheme].plainActiveBorder,
            },

            _disabled: {
              color: vars.colors[colorScheme].plainDisabledText,
              bg: vars.colors[colorScheme].plainDisabledBg,
              borderColor: vars.colors[colorScheme].plainDisabledBorder,
            },
          },
        },
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
    defaultVariants: {
      variant: "solid",
      size: "md",
      isFullWidth: false,
      isLoading: false,
    },
  })
);

export type ButtonStyleConfigProps = StyleConfigProps<typeof useStyleConfig>;
