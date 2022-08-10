import { isEmpty, isEmptyObject, isFunction } from "@hope-ui/utils";
import { mergeWith } from "lodash-es";
import { createMemo, createUniqueId } from "solid-js";

import { css } from "./stitches.config";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme } from "./theme";
import { useThemeStyles } from "./theme/theme-provider";
import {
  GetStaticClass,
  RecipeClassNames,
  RecipeConfig,
  RecipeConfigInterpolation,
  Theme,
  UseRecipeFn,
  UseRecipeOptions,
  VariantGroups,
  VariantSelection,
} from "./types";

/** Return whether a compound variant should be applied. */
function shouldApplyCompound<Parts extends string, Variants extends VariantGroups<Parts>>(
  compoundCheck: VariantSelection<Parts, Variants>,
  selections: VariantSelection<Parts, Variants>,
  defaultVariants: VariantSelection<Parts, Variants>
) {
  for (const key of Object.keys(compoundCheck)) {
    if (compoundCheck[key] !== (selections[key] ?? defaultVariants[key])) {
      return false;
    }
  }

  return true;
}

function extractRecipe<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
>(
  config: RecipeConfigInterpolation<Parts, Params, Variants> | undefined,
  theme: Theme,
  params: Params,
  getStaticClass: GetStaticClass<Parts>
): Partial<RecipeConfig<Parts, Variants>> {
  if (isFunction(config)) {
    return config(theme, params ?? ({} as Params), getStaticClass);
  }

  return config ?? {};
}

/** Create a `useRecipe` primitive. */
export function createRecipe<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
>(
  config: RecipeConfigInterpolation<Parts, Params, Variants>
): UseRecipeFn<Parts, Params, Variants> {
  const uniqueId = createUniqueId();

  const extractBaseRecipe = typeof config === "function" ? config : () => config;

  function useRecipe(options: UseRecipeOptions<Parts, Params, Variants>) {
    const getStaticClass: GetStaticClass<Parts> = part => {
      return `hope-${options.name || uniqueId}-${part}`;
    };

    const theme = useTheme();
    const themeStyles = useThemeStyles(options.name);

    const classes = createMemo(() => {
      const baseRecipe = options.unstyled
        ? {}
        : extractBaseRecipe(theme, options.params, getStaticClass);

      const themeRecipe = extractRecipe(themeStyles(), theme, options.params, getStaticClass);
      const propRecipe = extractRecipe(options.styles, theme, options.params, getStaticClass);

      // 1. merge recipe options
      const mergedRecipe: RecipeConfig<Parts, Variants> = mergeWith(
        {},
        baseRecipe,
        themeRecipe,
        propRecipe
      );

      const parts = mergedRecipe.parts;

      // 2. add "recipe base" classes
      const finalClassNames = Object.fromEntries(
        parts.map(key => {
          const baseStyleObject = mergedRecipe.base?.[key] ?? {};

          if (isEmptyObject(baseStyleObject)) {
            return [key, undefined];
          }

          const cssComponent = css(toCSSObject(baseStyleObject, theme));

          return [key, cssComponent().className];
        })
      ) as RecipeClassNames<Parts>;

      // 3. add "recipe variants" classes
      const selections = {
        ...mergedRecipe.defaultVariants,
        ...options.variants,
      } as VariantSelection<Parts, Variants>;

      for (const variantName in selections) {
        const variantSelection =
          selections[variantName] ?? mergedRecipe.defaultVariants?.[variantName];

        if (variantSelection != null) {
          let selection = variantSelection;

          if (typeof selection === "boolean") {
            // @ts-expect-error
            selection = selection === true ? "true" : "false";
          }

          const selectionClassNames = Object.fromEntries(
            parts.map(key => {
              const selectionStyleObject =
                mergedRecipe.variants?.[variantName as any]?.[selection as any][key] ?? {};

              if (isEmptyObject(selectionStyleObject)) {
                return [key, undefined];
              }

              const cssComponent = css(toCSSObject(selectionStyleObject, theme));

              return [key, cssComponent().className];
            })
          ) as RecipeClassNames<Parts>;

          parts.forEach(key => {
            const mergedClassNames = [finalClassNames[key], selectionClassNames[key]]
              .filter(Boolean)
              .join(" ");

            finalClassNames[key] = isEmpty(mergedClassNames) ? undefined : mergedClassNames;
          });
        }
      }

      // 4. add "recipe compoundVariants" classes
      for (const compoundVariant of mergedRecipe.compoundVariants ?? []) {
        if (
          shouldApplyCompound(
            compoundVariant.variants,
            selections,
            mergedRecipe.defaultVariants ?? {}
          )
        ) {
          const compoundClassNames = Object.fromEntries(
            parts.map(key => {
              const selectionStyleObject = compoundVariant.style[key] ?? {};

              if (isEmptyObject(selectionStyleObject)) {
                return [key, undefined];
              }

              const cssComponent = css(toCSSObject(selectionStyleObject, theme));

              return [key, cssComponent().className];
            })
          ) as RecipeClassNames<Parts>;

          parts.forEach(key => {
            const mergedClassNames = [finalClassNames[key], compoundClassNames[key]]
              .filter(Boolean)
              .join(" ");

            finalClassNames[key] = isEmpty(mergedClassNames) ? undefined : mergedClassNames;
          });
        }
      }

      // 5. add static classes
      parts.forEach(key => {
        const mergedClassNames = [finalClassNames[key], getStaticClass(key)]
          .filter(Boolean)
          .join(" ");

        finalClassNames[key] = isEmpty(mergedClassNames) ? undefined : mergedClassNames;
      });

      return finalClassNames;
    });

    return classes;
  }

  return useRecipe;
}

/*
interface ButtonParams {
  colorScheme: "foo" | "bar";
}

const useButtonRecipe = createRecipe((theme, params: ButtonParams) => ({
  parts: ["root", "icon", "title"],
  base: {
    root: {
      display: "inline-flex",
      width: "auto",
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
          borderColor: theme.vars.colors[params.colorScheme].solidBorder, // "var(--hope-colors-xxx-solid-border)",
          backgroundColor: theme.vars.colors[params.colorScheme].solidBackground, // "var(--hope-colors-xxx-solid-background)",
          color: theme.vars.colors[params.colorScheme].solidText, // "var(--hope-colors-xxx-solid-text)",
          "&:hover": {
            borderColor: theme.vars.colors[params.colorScheme].solidHoverBorder, // "var(--hope-colors-xxx-solid-hover-border)",
            backgroundColor: theme.vars.colors[params.colorScheme].solidHoverBackground, // "var(--hope-colors-xxx-solid-hover-background)",
            color: theme.vars.colors[params.colorScheme].solidHoverText, // "var(--hope-colors-xxx-solid-hover-text)",
          },
          "&:active": {
            borderColor: theme.vars.colors[params.colorScheme].solidActiveBorder, // "var(--hope-colors-xxx-solid-active-border)",
            backgroundColor: theme.vars.colors[params.colorScheme].solidActiveBackground, // "var(--hope-colors-xxx-solid-active-background)",
            color: theme.vars.colors[params.colorScheme].solidActiveText, // "var(--hope-colors-xxx-solid-active-text)",
          },
          "&:disabled": {
            borderColor: theme.vars.colors[params.colorScheme].solidDisabledBorder, // "var(--hope-colors-xxx-solid-disabled-border)",
            backgroundColor: theme.vars.colors[params.colorScheme].solidDisabledBackground, // "var(--hope-colors-xxx-solid-disabled-background)",
            color: theme.vars.colors[params.colorScheme].solidDisabledText, // "var(--hope-colors-xxx-solid-disabled-text)",
          },
        },
      },
      soft: {
        root: {
          borderColor: `${params.colorScheme}.softBorder`, // "var(--hope-colors-xxx-soft-border)",
          backgroundColor: `${params.colorScheme}.softBackground`, // "var(--hope-colors-xxx-soft-background)",
          color: `${params.colorScheme}.softText`, // "var(--hope-colors-xxx-soft-text)",
        },
      },
      outlined: {},
      plain: {},
    },
    size: {
      xs: {
        root: {
          height: theme.vars.sizes["8"], // "var(--hope-sizes-8)"
          px: 4, // "var(--hope-space-4)"
        },
      },
      sm: {},
      md: {},
      lg: {},
    },
    isFullWidth: {
      true: {
        root: {
          display: "flex",
          width: "100%",
        },
      },
    },
    chien: {
      red: {},
      baz: {},
    },
  },
  compoundVariants: [
    {
      variants: {
        variant: "solid",
        size: "sm",
      },
      style: {
        root: {},
        icon: {},
      },
    },
  ],
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
}));

type ButtonVariants = RecipeVariants<typeof useButtonRecipe>; // all variants

// typings.d.ts
import { ColorSystem, ThemeColor, ThemeScale, ThemeSpace } from '@hope-ui/core';

type ExtendedThemeColor = 'brand' | ThemeColor;
type ExtendedThemeSpace = 'foo' | ThemeSpace;

declare module '@hope/core' {
  export interface ThemeScale {
    colors: Record<ExtendedThemeColor, ColorSystem>;
    space: Record<ExtendedThemeSpace, string>;
  }
}

// theme.ts
  // 1. merge theme with DEFAULT_THEME
  // 2. append css variables to `:root`
  // 3. return theme object with `vars`
export const theme = extendTheme({
  colors: {
    light: {
      primary: { // neutral, success, info, warning, danger, (brand - via module augmentation)
        50: "",
        ...: "",
        900: "",

        mainChannel: "", // 500
        lightChannel: "", // 100
        darkChannel: "", // 900

        xxxText: "",
        xxxBackground: "",
        xxxBorder: "",

        xxxHoverText: "",
        xxxHoverBackground: "",
        xxxHoverBorder: "",

        xxxActiveText: "",
        xxxActiveBackground: "",
        xxxActiveBorder: "",

        xxxDisabledText: "",
        xxxDisabledBackground: "",
        xxxDisabledBorder: "",

        textPrimary: "",
        textSecondary: "",
        textTertiary: "",
      },
      common: {
        white: "",
        black: "",
      },
      text: {
        primary: "",
        secondary: "",
        tertiary: "",
      },
      background: {
        body: "",
        surface0: "",
        surface1: "",
        surface2: "",
        surface3: "",
        tooltip: "",
      },
      divider: "",
      focusRing: "",
    },
    dark: {},
  }
  space: {
    foo: "", // via module augmentation
    ...: "",
  },
  components: {
    Button: {
      defaultProps: {},
      styles: {
        root: {},
        icon: {}
      }
    }
  }
});

// App.tsx
import { theme } from "./theme";

function App() {
  return <HopeProvider theme={theme} />
}

*/
