/*!
 * Original code by SEEK
 * MIT Licensed, Copyright (c) 2021 SEEK.
 *
 * Credits to the SEEK team:
 * https://github.com/seek-oss/vanilla-extract/blob/master/packages/recipes/src/createRuntimeFn.ts
 *
 * Original code by Mantinedev
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/master/src/mantine-styles/src/tss/create-styles.ts
 */

import { isEmptyObject, isFunction } from "@hope-ui/utils";
import { mergeWith } from "lodash-es";
import { createMemo } from "solid-js";

import { useTheme, useThemeStyles } from "./theme";
import {
  PartialRecipeConfigInterpolation,
  RecipeConfig,
  RecipeConfigInterpolation,
  RecipeStylesObjects,
  SystemStyleObject,
  ThemeVars,
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
  config: PartialRecipeConfigInterpolation<Parts, Params, Variants> | undefined,
  vars: ThemeVars,
  params: Params
): Partial<RecipeConfig<Parts, Variants>> {
  if (isFunction(config)) {
    return config(vars, params ?? ({} as Params));
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
  const extractBaseRecipe = typeof config === "function" ? config : () => config;

  function useRecipe(options: UseRecipeOptions<Parts, Params, Variants>) {
    const theme = useTheme();
    const themeStyles = useThemeStyles(options.name);

    const styles = createMemo(() => {
      const baseRecipe = options.unstyled ? {} : extractBaseRecipe(theme.vars, options.params);

      const themeRecipe = extractRecipe(themeStyles(), theme.vars, options.params);
      const propRecipe = extractRecipe(options.styles, theme.vars, options.params);

      // 1. merge recipe options.
      const mergedRecipe: RecipeConfig<Parts, Variants> = mergeWith(
        {},
        baseRecipe,
        themeRecipe,
        propRecipe
      );

      // 2. add "recipe base" styles.
      const stylesMap = new Map<Parts, Array<SystemStyleObject | undefined>>(
        mergedRecipe.parts.map(part => [part, [mergedRecipe.base?.[part]]])
      );

      // 3. add "recipe variants" styles.
      const selections = {
        ...mergedRecipe.defaultVariants,
        ...options.variants,
      } as VariantSelection<Parts, Variants>;

      for (const variantName in selections) {
        const selection = selections[variantName] ?? mergedRecipe.defaultVariants?.[variantName];

        if (selection == null) {
          continue;
        }

        const selectionStyle =
          mergedRecipe.variants?.[variantName as any]?.[String(selection) as any];

        if (!selectionStyle) {
          continue;
        }

        Object.entries(selectionStyle).forEach(([part, style]) => {
          stylesMap.get(part as Parts)?.push(style as SystemStyleObject);
        });
      }

      // 4. add "recipe compoundVariants" styles.
      for (const compoundVariant of mergedRecipe.compoundVariants ?? []) {
        if (
          shouldApplyCompound(
            compoundVariant.variants,
            selections,
            mergedRecipe.defaultVariants ?? {}
          )
        ) {
          Object.entries(compoundVariant.style).forEach(([part, style]) => {
            stylesMap.get(part as Parts)?.push(style as SystemStyleObject);
          });
        }
      }

      const mergedStyles: any = {};

      // 5. merge all styles objects of each part.
      stylesMap.forEach((styles, part) => {
        mergedStyles[part] = mergeWith({}, ...styles);
      });

      return mergedStyles as RecipeStylesObjects<Parts>;
    });

    return styles;
  }

  return useRecipe;
}
