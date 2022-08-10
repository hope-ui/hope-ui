import { isEmpty, isEmptyObject, isFunction } from "@hope-ui/utils";
import { mergeWith } from "lodash-es";
import { Accessor, createMemo, createUniqueId } from "solid-js";

import { css } from "./stitches.config";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme } from "./theme";
import { useThemeStyles } from "./theme/theme-provider";
import { SystemStyleObject, Theme, ThemeBase } from "./types";

export type RecipePartsStyles<Parts extends string> = Record<Parts, SystemStyleObject>;
export type RecipePartsClassNames<Parts extends string> = Record<Parts, string>;

export type GetStaticClass<Parts extends string> = (part: Parts) => string;

export type VariantDefinitions<Parts extends string> = Record<
  string,
  Partial<RecipePartsStyles<Parts>>
>;

type BooleanMap<T> = T extends "true" | "false" ? boolean : T;

export type VariantGroups<Parts extends string> = Record<string, VariantDefinitions<Parts>>;

export type VariantSelection<Parts extends string, Variants extends VariantGroups<Parts>> = {
  [VariantGroup in keyof Variants]?: BooleanMap<keyof Variants[VariantGroup]>;
};

export interface CompoundVariant<Parts extends string, Variants extends VariantGroups<Parts>> {
  variants: VariantSelection<Parts, Variants>;
  style: Partial<RecipePartsStyles<Parts>>;
}

export type RecipeOptions<Parts extends string, Variants extends VariantGroups<Parts>> = {
  parts: Array<Parts>;
  base?: Partial<RecipePartsStyles<Parts>>;
  variants?: Variants;
  defaultVariants?: VariantSelection<Parts, Variants>;
  compoundVariants?: Array<CompoundVariant<Parts, Variants>>;
};

export type RecipeOptionsInterpolation<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
> =
  | RecipeOptions<Parts, Variants>
  | ((
      theme: ThemeBase,
      params: Params,
      getStaticClass: GetStaticClass<Parts>
    ) => RecipeOptions<Parts, Variants>);

export interface UseRecipeConfig<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
> {
  params: Params;
  variants?: VariantSelection<Parts, Variants>;
  styles?: RecipeOptions<Parts, Variants>;
  unstyled?: boolean;
  name?: string;
}

export type UseRecipeFn<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
> = (config: UseRecipeConfig<Parts, Params, Variants>) => Accessor<RecipePartsClassNames<Parts>>;

export type RecipeVariants<RecipeFn extends UseRecipeFn<any, any, any>> =
  Parameters<RecipeFn>[0]["variants"];

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

function extractRecipeOptions<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
>(
  recipeOptions: RecipeOptionsInterpolation<Parts, Params, Variants> | undefined,
  theme: Theme,
  params: Params,
  getStaticClass: GetStaticClass<Parts>
): Partial<RecipeOptions<Parts, Variants>> {
  if (isFunction(recipeOptions)) {
    return recipeOptions(theme, params ?? ({} as Params), getStaticClass);
  }

  return recipeOptions ?? {};
}

function createRecipe<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
>(options: RecipeOptionsInterpolation<Parts, Params, Variants>) {
  const uniqueId = createUniqueId();

  const extractBaseRecipeOptions = typeof options === "function" ? options : () => options;

  function useRecipe(config: UseRecipeConfig<Parts, Params, Variants>) {
    const getStaticClass: GetStaticClass<Parts> = part => {
      return `hope-${config.name || uniqueId}-${part}`;
    };

    const theme = useTheme();
    const themeStyles = useThemeStyles(config.name) as unknown as Accessor<
      RecipeOptions<Parts, Variants>
    >;

    const classes = createMemo(() => {
      const baseRecipeOptions = config.unstyled
        ? {}
        : extractBaseRecipeOptions(theme, config.params, getStaticClass);

      const themeRecipeOptions = extractRecipeOptions(
        themeStyles(),
        theme,
        config.params,
        getStaticClass
      );

      const propRecipeOptions = extractRecipeOptions(
        config.styles,
        theme,
        config.params,
        getStaticClass
      );

      // 1. merge recipe options
      const mergedRecipeOptions: RecipeOptions<Parts, Variants> = mergeWith(
        {},
        baseRecipeOptions,
        themeRecipeOptions,
        propRecipeOptions
      );

      const parts = mergedRecipeOptions.parts;

      // 2. add "recipe base" classes
      const finalClassNames = Object.fromEntries(
        parts.map(key => {
          const baseStyleObject = mergedRecipeOptions.base?.[key] ?? {};

          if (isEmptyObject(baseStyleObject)) {
            return [key, undefined];
          }

          const cssComponent = css(toCSSObject(baseStyleObject, theme));

          return [key, cssComponent().className];
        })
      ) as Partial<RecipePartsClassNames<Parts>>;

      // 3. add "recipe variants" classes
      const selections = {
        ...mergedRecipeOptions.defaultVariants,
        ...config.variants,
      } as VariantSelection<Parts, Variants>;

      for (const variantName in selections) {
        const variantSelection =
          selections[variantName] ?? mergedRecipeOptions.defaultVariants?.[variantName];

        if (variantSelection != null) {
          let selection = variantSelection;

          if (typeof selection === "boolean") {
            // @ts-expect-error
            selection = selection === true ? "true" : "false";
          }

          const selectionClassNames = Object.fromEntries(
            parts.map(key => {
              const selectionStyleObject =
                mergedRecipeOptions.variants?.[variantName as any]?.[selection as any][key] ?? {};

              if (isEmptyObject(selectionStyleObject)) {
                return [key, undefined];
              }

              const cssComponent = css(toCSSObject(selectionStyleObject, theme));

              return [key, cssComponent().className];
            })
          ) as RecipePartsClassNames<Parts>;

          parts.forEach(key => {
            const mergedClassNames = [finalClassNames[key], selectionClassNames[key]]
              .filter(Boolean)
              .join(" ");

            finalClassNames[key] = isEmpty(mergedClassNames) ? undefined : mergedClassNames;
          });
        }
      }

      // 4. add "recipe compoundVariants" classes
      for (const compoundVariant of mergedRecipeOptions.compoundVariants ?? []) {
        if (
          shouldApplyCompound(
            compoundVariant.variants,
            selections,
            mergedRecipeOptions.defaultVariants ?? {}
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
          ) as RecipePartsClassNames<Parts>;

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

    return { classes, getStaticClass };
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
