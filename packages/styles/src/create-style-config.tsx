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
import { DEFAULT_THEME, useTheme, useThemeStyleConfig } from "./theme";
import {
  ClassNameObjects,
  ReverseBooleanMap,
  StyleConfig,
  StyleConfigInterpolation,
  StyleConfigOverride,
  StyleConfigOverrideInterpolation,
  StyleObjects,
  SystemStyleObject,
  Theme,
  ThemeColorScheme,
  ThemeVars,
  UseStyleConfigFn,
  UseStyleConfigFnReturn,
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

  const baseStyleConfig = extractBaseStyleConfig({
    vars: DEFAULT_THEME.vars,
    colorScheme: "primary",
  });

  const baseStyleConfigClassNames = computeClassNames<Parts, VariantDefinitions>(
    baseStyleConfig,
    DEFAULT_THEME
  );

  // get component parts from config baseStyle object.
  const parts = Object.keys(baseStyleConfig.baseStyle) as Array<Parts>;

  return function useStyleConfig(
    name: string,
    options: UseStyleConfigOptions<Parts, VariantDefinitions>
  ): UseStyleConfigFnReturn<Parts> {
    const theme = useTheme();
    const themeStyleConfig = useThemeStyleConfig(name);

    const styleConfigOverrides = createMemo(() => {
      const {
        colorScheme = "primary", // fallback to primary colorScheme if not provided.
        styleConfigOverride,
      } = options;

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

      return mergeWith({}, themeStyleConfigOverride, componentStyleConfigOverride) as StyleConfig<
        Parts,
        VariantDefinitions
      >;
    });

    const selectedVariants = createMemo(() => {
      const [_, variantSelections] = splitProps(options, [
        "colorScheme",
        "styleConfigOverride",
        "unstyled",
      ]);

      return {
        ...baseStyleConfig.defaultVariants,
        ...filterUndefined(styleConfigOverrides().defaultVariants ?? {}),
        ...filterUndefined(variantSelections),
      } as VariantSelection<VariantDefinitions>;
    });

    const classes = createMemo(() => {
      // If unstyled, return empty classNames for each part.
      if (options.unstyled) {
        return Object.fromEntries(parts.map(part => [part, ""])) as ClassNameObjects<Parts>;
      }

      // 1. add "base" classNames.
      const classNamesMap = new Map(
        parts.map(part => [part, [baseStyleConfigClassNames.baseClassName?.[part]]])
      );

      // 2. add "variants" classNames.
      for (const variantName in selectedVariants()) {
        const selection = selectedVariants()[variantName];

        if (selection == null) {
          continue;
        }

        const selectionClassNameObjects =
          // @ts-ignore
          baseStyleConfigClassNames.variants?.[variantName]?.[String(selection)];

        if (selectionClassNameObjects != null) {
          Object.entries(selectionClassNameObjects).forEach(([part, className]) => {
            classNamesMap.get(part as Parts)?.push(className as string);
          });
        }
      }

      // 3. add "compoundVariants" classNames.
      for (const compoundVariant of baseStyleConfigClassNames.compoundVariants ?? []) {
        if (shouldApplyCompound(compoundVariant.variants, selectedVariants())) {
          Object.entries(compoundVariant.classNames).forEach(([part, className]) => {
            classNamesMap.get(part as Parts)?.push(className as string);
          });
        }
      }

      // 4. merge all classNames of each part.
      return Object.fromEntries(
        Array.from(classNamesMap.entries()).map(([part, classNames]) => [
          part,
          clsx(`hope-${name}-${part}`, ...classNames),
        ])
      ) as ClassNameObjects<Parts>;
    });

    const styles = createMemo(() => {
      // 1. add "base" styles.
      const stylesMap = new Map(
        parts.map(part => [part, [styleConfigOverrides().baseStyle?.[part]]])
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
          Object.entries(compoundVariant.style).forEach(([part, style]) => {
            stylesMap.get(part as Parts)?.push(style as SystemStyleObject);
          });
        }
      }

      // 4. merge all styles objects of each part.
      return Object.fromEntries(
        Array.from(stylesMap.entries()).map(([part, styles]) => [part, mergeWith({}, ...styles)])
      ) as StyleObjects<Parts>;
    });

    return { classes, styles };
  };
}

type VariantsClassNames<Parts extends string, T extends Record<string, any>> = {
  [K in keyof T]?: {
    [V in ReverseBooleanMap<T[K]>]?: Partial<ClassNameObjects<Parts>>;
  };
};

interface CompoundVariantClassNames<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> {
  /** The combined variants that should apply the styles. */
  variants: VariantSelection<VariantDefinitions>;

  /** The styles to be applied. */
  classNames: Partial<ClassNameObjects<Parts>>;
}

interface StyleConfigClassNames<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> {
  /** The base classNames of each part. */
  baseClassName: Partial<ClassNameObjects<Parts>>;

  /** The variants classNames of each part. */
  variants: VariantsClassNames<Parts, VariantDefinitions>;

  /** The combined variants classNames of each part. */
  compoundVariants: Array<CompoundVariantClassNames<Parts, VariantDefinitions>>;
}

function computeClassNames<Parts extends string, VariantDefinitions extends Record<string, any>>(
  styleConfig: StyleConfig<Parts, VariantDefinitions>,
  theme: Theme
): StyleConfigClassNames<Parts, VariantDefinitions> {
  // 1. create "base" classNames.
  const baseClassNames = Object.fromEntries(
    Object.entries(styleConfig.baseStyle).map(([part, style]) => {
      return [part, css(toCSSObject(style as SystemStyleObject, theme))().className];
    })
  );

  // 2. create "variants" classNames.
  const variantsClassNames = styleConfig.variants
    ? Object.fromEntries(
        Object.entries(styleConfig.variants).map(([variant, definition]) => {
          return [
            variant,
            Object.fromEntries(
              Object.entries(definition).map(([value, styleObjects]) => {
                return [
                  value,
                  Object.fromEntries(
                    Object.entries(styleObjects as any).map(([part, style]) => {
                      return [
                        part,
                        css(toCSSObject(style as SystemStyleObject, theme))().className,
                      ];
                    })
                  ),
                ];
              })
            ),
          ];
        })
      )
    : {};

  // 3. create "compound variants" classNames.
  const compoundVariantsClassNames = styleConfig.compoundVariants?.map(compoundVariant => ({
    variants: compoundVariant.variants,
    classNames: Object.fromEntries(
      Object.entries(compoundVariant.style).map(([part, style]) => {
        return [part, css(toCSSObject(style as SystemStyleObject, theme))().className];
      })
    ),
  }));

  return {
    baseClassName: baseClassNames,
    variants: variantsClassNames,
    compoundVariants: compoundVariantsClassNames,
  } as StyleConfigClassNames<Parts, VariantDefinitions>;
}
