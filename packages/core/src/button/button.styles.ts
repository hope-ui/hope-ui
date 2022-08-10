import { createRecipe, RecipeProps, ThemeColor } from "@hope-ui/styles";

export interface ButtonParams {
  /** The color of the button. */
  colorScheme: ThemeColor;
}

export const useRecipe = createRecipe((theme, params: ButtonParams) => {
  console.log(theme.colorMode);

  return {
    parts: ["root", "icon"],
    base: {
      root: {
        appearance: "none",
        position: "relative",
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        width: "auto",
        outline: "none",
        border: "1px solid transparent",
        borderRadius: "6px",
        padding: "0",
        fontFamily: "inherit",
        fontSize: "100%",
        fontWeight: 500,
        lineHeight: 1,
        textDecoration: "none",
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        verticalAlign: "middle",
        transitionProperty: "color, border-color, background-color, box-shadow",
        transitionDuration: "250ms",
      },
      icon: {},
    },
    variants: {
      variant: {
        solid: {},
        soft: {},
        outlined: {
          root: {
            bg: theme.colorMode == "dark" ? "blue" : "red",
          },
        },
        plain: {},
      },
      size: {
        xs: {},
        sm: {},
        md: {
          root: {
            height: "40px",
            padding: "0 20px",
            fontSize: "16px",
          },
        },
        lg: {},
      },
      isFullWidth: {
        true: {},
        false: {},
      },
      isLoading: {
        true: {},
        false: {},
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
