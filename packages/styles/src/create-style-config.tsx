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

import { isFunction } from "@hope-ui/utils";
import { mergeWith } from "lodash-es";
import { createMemo } from "solid-js";

import { useTheme, useThemeStyleConfig } from "./theme";
import {
  StyleConfig,
  StyleConfigInterpolation,
  StyleConfigOverride,
  StyleConfigOverrideInterpolation,
  StylesObjects,
  SystemStyleObject,
  ThemeVars,
  UseStyleConfigFn,
  UseStyleConfigOptions,
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

function extractStyleConfigOverride<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
>(
  config: StyleConfigOverrideInterpolation<Parts, Params, Variants> | undefined,
  vars: ThemeVars,
  params: Params
): StyleConfigOverride<Parts, Variants> {
  if (isFunction(config)) {
    return config(vars, params ?? ({} as Params));
  }

  return config ?? {};
}

/** Create a `useStyleConfig` primitive. */
export function createStyleConfig<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
>(
  interpolation: StyleConfigInterpolation<Parts, Params, Variants>
): UseStyleConfigFn<Parts, Params, Variants> {
  const extractBaseStyleConfig = isFunction(interpolation) ? interpolation : () => interpolation;

  function useStyles(options: UseStyleConfigOptions<Parts, Params, Variants>) {
    const theme = useTheme();
    const themeStyleConfig = useThemeStyleConfig(options.name);

    const styles = createMemo(() => {
      // base.
      const baseStyleConfig = options.unstyled
        ? {}
        : extractBaseStyleConfig(theme.vars, options.params);

      // overrides from theme.
      const themeStyleConfigOverride = extractStyleConfigOverride(
        themeStyleConfig(),
        theme.vars,
        options.params
      );

      // overrides from component `styleConfig` prop.
      const componentStyleConfigOverride = extractStyleConfigOverride(
        options.styleConfig,
        theme.vars,
        options.params
      );

      // 1. merge styles configs.
      const mergedConfig: StyleConfig<Parts, Variants> = mergeWith(
        {},
        baseStyleConfig,
        themeStyleConfigOverride,
        componentStyleConfigOverride
      );

      // 2. add "base" styles.
      const stylesMap = new Map<Parts, Array<SystemStyleObject | undefined>>(
        mergedConfig.parts.map(part => [part, [mergedConfig.baseStyle?.[part]]])
      );

      // 3. add "variants" styles.
      const selections = {
        ...mergedConfig.defaultVariants,
        ...options.variants,
      } as VariantSelection<Parts, Variants>;

      for (const variantName in selections) {
        const selection = selections[variantName] ?? mergedConfig.defaultVariants?.[variantName];

        if (selection == null) {
          continue;
        }

        const selectionStyle =
          mergedConfig.variants?.[variantName as any]?.[String(selection) as any];

        if (!selectionStyle) {
          continue;
        }

        Object.entries(selectionStyle).forEach(([part, style]) => {
          stylesMap.get(part as Parts)?.push(style as SystemStyleObject);
        });
      }

      // 4. add "compoundVariants" styles.
      for (const compoundVariant of mergedConfig.compoundVariants ?? []) {
        if (
          shouldApplyCompound(
            compoundVariant.variants,
            selections,
            mergedConfig.defaultVariants ?? {}
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

      return mergedStyles as StylesObjects<Parts>;
    });

    return styles;
  }

  return useStyles;
}
