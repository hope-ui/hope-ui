import { createRecipe, focusStyles, RecipeProps, ThemeColorPalette } from "@hope-ui/styles";

export interface ButtonParams {
  /** The color of the button. */
  colorScheme: ThemeColorPalette;
}

export const useRecipe = createRecipe((vars, params: ButtonParams) => {
  return {
    parts: ["root", "icon"],
    base: {
      root: {
        appearance: "none",
        position: "relative",

        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,

        width: "auto",

        outline: "none",

        border: "1px solid transparent",
        borderRadius: "sm",

        padding: "0",

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

        ...focusStyles(vars),
      },
      icon: {
        display: "inline-flex",
        alignSelf: "center",
        flexShrink: 0,
      },
    },
    variants: {
      variant: {
        solid: {
          root: {
            color: vars.colors[params.colorScheme].solidText,
            bg: vars.colors[params.colorScheme].solidBg,
            borderColor: vars.colors[params.colorScheme].solidBorder,

            _hover: {
              color: vars.colors[params.colorScheme].solidHoverText,
              bg: vars.colors[params.colorScheme].solidHoverBg,
              borderColor: vars.colors[params.colorScheme].solidHoverBorder,
            },

            _active: {
              color: vars.colors[params.colorScheme].solidActiveText,
              bg: vars.colors[params.colorScheme].solidActiveBg,
              borderColor: vars.colors[params.colorScheme].solidActiveBorder,
            },

            _disabled: {
              color: vars.colors[params.colorScheme].solidDisabledText,
              bg: vars.colors[params.colorScheme].solidDisabledBg,
              borderColor: vars.colors[params.colorScheme].solidDisabledBorder,
            },
          },
        },
        soft: {
          root: {
            color: vars.colors[params.colorScheme].softText,
            bg: vars.colors[params.colorScheme].softBg,
            borderColor: vars.colors[params.colorScheme].softBorder,

            _hover: {
              color: vars.colors[params.colorScheme].softHoverText,
              bg: vars.colors[params.colorScheme].softHoverBg,
              borderColor: vars.colors[params.colorScheme].softHoverBorder,
            },

            _active: {
              color: vars.colors[params.colorScheme].softActiveText,
              bg: vars.colors[params.colorScheme].softActiveBg,
              borderColor: vars.colors[params.colorScheme].softActiveBorder,
            },

            _disabled: {
              color: vars.colors[params.colorScheme].softDisabledText,
              bg: vars.colors[params.colorScheme].softDisabledBg,
              borderColor: vars.colors[params.colorScheme].softDisabledBorder,
            },
          },
        },
        outlined: {
          root: {
            color: vars.colors[params.colorScheme].outlinedText,
            bg: vars.colors[params.colorScheme].outlinedBg,
            borderColor: vars.colors[params.colorScheme].outlinedBorder,

            _hover: {
              color: vars.colors[params.colorScheme].outlinedHoverText,
              bg: vars.colors[params.colorScheme].outlinedHoverBg,
              borderColor: vars.colors[params.colorScheme].outlinedHoverBorder,
            },

            _active: {
              color: vars.colors[params.colorScheme].outlinedActiveText,
              bg: vars.colors[params.colorScheme].outlinedActiveBg,
              borderColor: vars.colors[params.colorScheme].outlinedActiveBorder,
            },

            _disabled: {
              color: vars.colors[params.colorScheme].outlinedDisabledText,
              bg: vars.colors[params.colorScheme].outlinedDisabledBg,
              borderColor: vars.colors[params.colorScheme].outlinedDisabledBorder,
            },
          },
        },
        plain: {
          root: {
            color: vars.colors[params.colorScheme].plainText,
            bg: vars.colors[params.colorScheme].plainBg,
            borderColor: vars.colors[params.colorScheme].plainBorder,

            _hover: {
              color: vars.colors[params.colorScheme].plainHoverText,
              bg: vars.colors[params.colorScheme].plainHoverBg,
              borderColor: vars.colors[params.colorScheme].plainHoverBorder,
            },

            _active: {
              color: vars.colors[params.colorScheme].plainActiveText,
              bg: vars.colors[params.colorScheme].plainActiveBg,
              borderColor: vars.colors[params.colorScheme].plainActiveBorder,
            },

            _disabled: {
              color: vars.colors[params.colorScheme].plainDisabledText,
              bg: vars.colors[params.colorScheme].plainDisabledBg,
              borderColor: vars.colors[params.colorScheme].plainDisabledBorder,
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
      },
      isLoading: {
        true: {
          root: {
            opacity: 0.8,
          },
        },
      },
    },
    defaultVariants: {
      variant: "outlined",
      size: "md",
      isFullWidth: false,
      isLoading: false,
    },
  };
});

export type ButtonRecipeProps = RecipeProps<typeof useRecipe>;
