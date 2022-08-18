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
import { clsx } from "clsx";
import { mergeWith } from "lodash-es";
import { createMemo, splitProps } from "solid-js";

import { css } from "./stitches.config";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme, useThemeStyleConfig } from "./theme";
import {
  ClassNameObjects,
  StyleConfig,
  StyleConfigClassNames,
  StyleConfigInterpolation,
  StyleConfigOverride,
  StyleConfigOverrideInterpolation,
  StyleObjects,
  SystemStyleObject,
  Theme,
  ThemeVars,
  UseStyleConfigFn,
  UseStyleConfigOptions,
  UseStyleConfigReturn,
  VariantSelection,
} from "./types";

/** Convert style objects to className objects. */
function toClassNameObjects<Parts extends string>(
  styleObjects: Partial<StyleObjects<Parts>>,
  theme: Theme
): Partial<ClassNameObjects<Parts>> {
  return Object.entries(styleObjects).reduce((acc, [part, style]) => {
    acc[part] = css(toCSSObject(style as SystemStyleObject, theme))().className;
    return acc;
  }, {} as any);
}

/** Compute classNames from a style config. */
function computeClassNames<Parts extends string, VariantDefinitions extends Record<string, any>>(
  styleConfig: StyleConfig<Parts, VariantDefinitions>,
  theme: Theme
): StyleConfigClassNames<Parts, VariantDefinitions> {
  const { baseStyles = {}, variants = {}, compoundVariants = [] } = styleConfig;

  // 1. create "base" classNames.
  const baseClassNames = toClassNameObjects(baseStyles, theme);

  // 2. create "variants" classNames.
  const variantsClassNames = Object.entries(variants).reduce((acc, [variant, definition]) => {
    // a variant like "size"
    acc[variant] = Object.entries(definition as any).reduce((acc, [value, styleObjects]) => {
      // a variant value like "sm"
      acc[value] = toClassNameObjects(styleObjects as any, theme);
      return acc;
    }, {} as any);
    return acc;
  }, {} as any);

  // 3. create "compound variants" classNames.
  const compoundVariantsClassNames = compoundVariants.map(compoundVariant => ({
    variants: compoundVariant.variants,
    classNames: toClassNameObjects(compoundVariant.styles, theme),
  }));

  return {
    baseClassNames: baseClassNames,
    variants: variantsClassNames,
    compoundVariants: compoundVariantsClassNames,
  } as StyleConfigClassNames<Parts, VariantDefinitions>;
}

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
  vars: ThemeVars
): StyleConfigOverride<Parts, VariantDefinitions> {
  if (isFunction(config)) {
    return config(vars);
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

  let isFirstLoad = true;
  let baseStyleConfig: StyleConfig<Parts, VariantDefinitions> | undefined;
  let baseStyleConfigClassNames: StyleConfigClassNames<Parts, VariantDefinitions> | undefined;
  let parts: Array<Parts> = [];

  return function useStyleConfig(
    name: string,
    options: UseStyleConfigOptions<Parts, VariantDefinitions>
  ): UseStyleConfigReturn<Parts> {
    const theme = useTheme();
    const themeStyleConfig = useThemeStyleConfig(name);

    // Hack to make sure base style config is computed only once for every component instance,
    // but has access to the current theme since `useStyleConfig` run in a component context.
    if (isFirstLoad) {
      baseStyleConfig = extractBaseStyleConfig(theme.vars);

      baseStyleConfigClassNames = computeClassNames(baseStyleConfig, theme);

      // get component parts from config baseStyles object.
      parts = Object.keys(baseStyleConfig?.baseStyles) as Array<Parts>;

      isFirstLoad = false;
    }

    const styleConfigOverrides = createMemo(() => {
      // overrides from theme.
      const themeStyleConfigOverride = extractStyleConfigOverride(themeStyleConfig(), theme.vars);

      // overrides from component `styleConfig` prop.
      const componentStyleConfigOverride = extractStyleConfigOverride(
        options.styleConfigOverride,
        theme.vars
      );

      return mergeWith({}, themeStyleConfigOverride, componentStyleConfigOverride) as StyleConfig<
        Parts,
        VariantDefinitions
      >;
    });

    const selectedVariants = createMemo(() => {
      const [_, variantSelections] = splitProps(options, ["styleConfigOverride", "unstyled"]);

      return {
        ...baseStyleConfig?.defaultVariants,
        ...filterUndefined(styleConfigOverrides().defaultVariants ?? {}),
        ...filterUndefined(variantSelections),
      } as VariantSelection<VariantDefinitions>;
    });

    const classes = createMemo(() => {
      // If unstyled, return empty object.
      if (options.unstyled) {
        return {} as ClassNameObjects<Parts>;
      }

      // 1. add "base" classNames.
      const classNamesMap = new Map(
        parts.map(part => [part, [baseStyleConfigClassNames?.baseClassNames[part]]])
      );

      // 2. add "variants" classNames.
      for (const variantName in selectedVariants()) {
        const selection = selectedVariants()[variantName];

        if (selection == null) {
          continue;
        }

        const selectionClassNameObjects =
          // @ts-ignore
          baseStyleConfigClassNames.variants[variantName]?.[String(selection)];

        if (selectionClassNameObjects != null) {
          Object.entries(selectionClassNameObjects).forEach(([part, className]) => {
            classNamesMap.get(part as Parts)?.push(className as string);
          });
        }
      }

      // 3. add "compoundVariants" classNames.
      for (const compoundVariant of baseStyleConfigClassNames?.compoundVariants ?? []) {
        if (shouldApplyCompound(compoundVariant.variants, selectedVariants())) {
          Object.entries(compoundVariant.classNames).forEach(([part, className]) => {
            classNamesMap.get(part as Parts)?.push(className as string);
          });
        }
      }

      // 4. merge all classNames of each part.
      return Array.from(classNamesMap.entries()).reduce((acc, [part, classNames]) => {
        const staticClass = `hope-${name}-${part}`;
        acc[part] = clsx(staticClass, ...classNames);
        return acc;
      }, {} as ClassNameObjects<Parts>);
    });

    const styles = createMemo(() => {
      // 1. add "base" styles.
      const stylesMap = new Map(
        parts.map(part => [part, [styleConfigOverrides().baseStyles?.[part]]])
      );

      // 2. add "variants" styles.
      for (const variantName in selectedVariants()) {
        const selection = selectedVariants()[variantName];

        if (selection == null) {
          continue;
        }

        const selectionStyleObjects =
          // @ts-ignore
          styleConfigOverrides().variants?.[variantName]?.[String(selection)];

        if (selectionStyleObjects != null) {
          Object.entries(selectionStyleObjects).forEach(([part, style]) => {
            stylesMap.get(part as Parts)?.push(style as SystemStyleObject);
          });
        }
      }

      // 3. add "compoundVariants" styles.
      for (const compoundVariant of styleConfigOverrides().compoundVariants ?? []) {
        if (shouldApplyCompound(compoundVariant.variants, selectedVariants())) {
          Object.entries(compoundVariant.styles).forEach(([part, style]) => {
            stylesMap.get(part as Parts)?.push(style as SystemStyleObject);
          });
        }
      }

      // 4. merge all styles objects of each part.
      return Array.from(stylesMap.entries()).reduce((acc, [part, styles]) => {
        acc[part] = mergeWith({}, ...styles);
        return acc;
      }, {} as StyleObjects<Parts>);
    });

    return { classes, styles };
  };
}
