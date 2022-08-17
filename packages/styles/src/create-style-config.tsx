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

import { filterUndefined, isFunction } from "@hope-ui/utils";
import { mergeWith } from "lodash-es";
import { createMemo } from "solid-js";

import { useTheme, useThemeStyleConfig } from "./theme";
import {
  StyleConfig,
  StyleConfigInterpolation,
  StyleConfigOverride,
  StyleConfigOverrideInterpolation,
  StyleObjects,
  SystemStyleObject,
  ThemeColorScheme,
  ThemeVars,
  UseStyleConfigFn,
  UseStyleConfigOptions,
  VariantSelection,
} from "./types";

/** Return whether a compound variant should be applied. */
function shouldApplyCompound<T extends VariantSelection<any>>(compoundCheck: T, selections: T) {
  for (const key of Object.keys(compoundCheck)) {
    if (compoundCheck[key] !== selections[key]) {
      return false;
    }
  }

  return true;
}

function extractStyleConfigOverride<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
>(
  config: StyleConfigOverrideInterpolation<Parts, VariantDefinitions> | undefined,
  vars: ThemeVars,
  colorScheme: ThemeColorScheme
): StyleConfigOverride<Parts, VariantDefinitions> {
  if (isFunction(config)) {
    return config({ vars, colorScheme });
  }

  return config ?? {};
}

/** Create a `useStyleConfig` primitive. */
export function createStyleConfig<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
>(
  interpolation: StyleConfigInterpolation<Parts, VariantDefinitions>
): UseStyleConfigFn<Parts, VariantDefinitions> {
  const extractBaseStyleConfig = isFunction(interpolation) ? interpolation : () => interpolation;

  function useStyles(name: string, options: UseStyleConfigOptions<Parts, VariantDefinitions>) {
    const theme = useTheme();
    const themeStyleConfig = useThemeStyleConfig(name);

    const styles = createMemo(() => {
      const {
        colorScheme = "primary", // fallback to primary colorScheme if not provided.
        styleConfigOverride,
        unstyled,
        ...variantSelections
      } = options;

      // base.
      const baseStyleConfig = extractBaseStyleConfig({ vars: theme.vars, colorScheme });

      // get component parts from baseStyle object.
      const parts = Object.keys(baseStyleConfig.baseStyle) as Array<Parts>;

      // overrides from theme.
      const themeStyleConfigOverride = extractStyleConfigOverride(
        themeStyleConfig(),
        theme.vars,
        colorScheme
      );

      // overrides from component `styleConfig` prop.
      const componentStyleConfigOverride = extractStyleConfigOverride(
        styleConfigOverride,
        theme.vars,
        colorScheme
      );

      // 1. merge styles configs.
      const mergedConfig = mergeWith(
        {},
        !unstyled ? baseStyleConfig : {},
        themeStyleConfigOverride,
        componentStyleConfigOverride
      ) as StyleConfig<Parts, VariantDefinitions>;

      // 2. add "base" styles.
      const stylesMap = new Map(parts.map(part => [part, [mergedConfig.baseStyle?.[part]]]));

      // 3. add "variants" styles.
      const selections = {
        ...mergedConfig.defaultVariants,
        ...filterUndefined(variantSelections),
      } as VariantSelection<VariantDefinitions>;

      for (const variantName in selections) {
        const selection = selections[variantName];

        if (selection == null) {
          continue;
        }

        // @ts-ignore
        const selectionStyle = mergedConfig.variants?.[variantName]?.[String(selection)];

        if (!selectionStyle) {
          continue;
        }

        Object.entries(selectionStyle).forEach(([part, style]) => {
          stylesMap.get(part as Parts)?.push(style as SystemStyleObject);
        });
      }

      // 4. add "compoundVariants" styles.
      for (const compoundVariant of mergedConfig.compoundVariants ?? []) {
        if (shouldApplyCompound(compoundVariant.variants, selections)) {
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

      return mergedStyles as StyleObjects<Parts>;
    });

    return styles;
  }

  return useStyles;
}
