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

import { filterUndefined, runIfFn } from "@hope-ui/utils";
import { clsx } from "clsx";
import { mergeWith } from "lodash-es";
import { createMemo, splitProps } from "solid-js";

import { css } from "./stitches.config";
import { toCSSObject } from "./styled-system/to-css-object";
import { useComponentTheme, useTheme } from "./theme";
import {
  ClassNames,
  CompoundVariant,
  CompoundVariantClassNames,
  MultiPartStyleConfig,
  MultiPartStyleConfigInterpolation,
  MultiPartStyleConfigResult,
  StyleConfig,
  StyleConfigResult,
  Styles,
  SystemStyleObject,
  Theme,
  UseStyleConfigFn,
  UseStyleConfigOptions,
  Variants,
  VariantsClassNames,
  VariantSelection,
} from "./types";

/** Get className of computed style object. */
function computeClassName(style: SystemStyleObject, theme: Theme): string {
  return css(toCSSObject(style, theme))().className;
}

/** Compute classNames of each variant values. */
function computeVariantsClassNames(variants: Variants<any>, theme: Theme): VariantsClassNames<any> {
  return Object.entries(variants).reduce((acc, [variant, definition]) => {
    // a variant (ex: "size")
    acc[variant] = Object.entries(definition as Record<string, SystemStyleObject>).reduce(
      (acc, [value, style]) => {
        // a variant value (ex: "sm")
        acc[value] = computeClassName(style, theme);
        return acc;
      },
      {} as any
    );
    return acc;
  }, {} as any);
}

/** Compute className of each compound variants. */
function computeCompoundVariantsClassNames(
  compoundVariants: CompoundVariant<any>[],
  theme: Theme
): CompoundVariantClassNames<any>[] {
  return compoundVariants.map(compoundVariant => ({
    variants: compoundVariant.variants,
    className: computeClassName(compoundVariant.style, theme),
  }));
}

/** Compute classNames from a style config. */
function computeStyleConfig(styleConfig: StyleConfig<any>, theme: Theme): StyleConfigResult<any> {
  const { base = {}, variants = {}, compoundVariants = [] } = styleConfig;

  return {
    base: computeClassName(base, theme),
    variants: computeVariantsClassNames(variants, theme),
    compoundVariants: computeCompoundVariantsClassNames(compoundVariants, theme),
  };
}

/** Compute classNames from a multi-parts style config. */
function computeMultiPartStyleConfig<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
>(
  multiPartStyleConfig: Partial<MultiPartStyleConfig<Parts, VariantDefinitions>>,
  theme: Theme
): Partial<MultiPartStyleConfigResult<Parts, VariantDefinitions>> {
  return Object.entries(multiPartStyleConfig).reduce((acc, [part, config]) => {
    acc[part] = computeStyleConfig(config as StyleConfig<VariantDefinitions>, theme);
    return acc;
  }, {} as any);
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

/** Create a `useStyleConfig` primitive. */
export function createStyleConfig<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
>(
  interpolation: MultiPartStyleConfigInterpolation<Parts, VariantDefinitions>,
  defaultVariants?: VariantSelection<VariantDefinitions>
): UseStyleConfigFn<Parts, VariantDefinitions> {
  let isFirstLoad = true;

  let baseConfig: MultiPartStyleConfig<Parts, VariantDefinitions> | undefined;
  let baseConfigResult: MultiPartStyleConfigResult<Parts, VariantDefinitions> | undefined;

  let themeConfig: Partial<MultiPartStyleConfig<Parts, VariantDefinitions>> | undefined;
  let themeConfigResult: Partial<MultiPartStyleConfigResult<Parts, VariantDefinitions>> | undefined;

  let parts: Array<Parts> = [];

  return function useStyleConfig(
    name: string,
    options: UseStyleConfigOptions<Parts, VariantDefinitions>
  ) {
    const theme = useTheme();
    const componentTheme = useComponentTheme(name);

    // Hack to make sure base style config is computed only once for every component instance,
    // but has access to the current theme since `useStyleConfig` run in a component context.
    if (isFirstLoad) {
      // 1. compute base styles.
      baseConfig = runIfFn(interpolation, theme.vars);
      baseConfigResult = computeMultiPartStyleConfig(baseConfig, theme) as any; // force type because we know it's not a partial.

      // 2. compute theme styles, so it will be injected to `head` after base styles.
      themeConfig = runIfFn(componentTheme()?.styleConfigOverrides, theme.vars);
      themeConfigResult = themeConfig && computeMultiPartStyleConfig(themeConfig, theme);

      // get component parts from config.
      parts = Object.keys(baseConfig) as Array<Parts>;

      isFirstLoad = false;
    }

    const styleConfigOverrides = createMemo(() => {
      return runIfFn(options.styleConfigOverrides, theme.vars);
    });

    const selectedVariants = createMemo(() => {
      const [_, variantSelections] = splitProps(options, ["styleConfigOverrides", "unstyled"]);

      return {
        ...defaultVariants,
        ...filterUndefined(variantSelections),
      } as VariantSelection<VariantDefinitions>;
    });

    const classes = createMemo(() => {
      if (options.unstyled) {
        return {} as ClassNames<Parts>;
      }

      return parts.reduce((acc, part) => {
        const base = baseConfigResult?.[part].base ?? "";
        const variants = baseConfigResult?.[part].variants ?? ({} as any);
        const compoundVariants = baseConfigResult?.[part].compoundVariants ?? [];

        const themeBase = themeConfigResult?.[part]?.base ?? "";
        const themeVariants = themeConfigResult?.[part]?.variants ?? ({} as any);
        const themeCompoundVariants = themeConfigResult?.[part]?.compoundVariants ?? [];

        // 1. add "static" and "base" classNames.
        const classNames = [`hope-${name}-${part}`, base, themeBase];

        // 2. add "variants" classNames.
        for (const name in selectedVariants()) {
          const value = selectedVariants()[name];

          if (value == null) {
            continue;
          }

          classNames.push(variants[name]?.[String(value)]);
          classNames.push(themeVariants[name]?.[String(value)]);
        }

        // 3. add "compound variants" classNames.
        for (const compoundVariant of [...compoundVariants, ...themeCompoundVariants]) {
          if (shouldApplyCompound(compoundVariant.variants, selectedVariants())) {
            classNames.push(compoundVariant.className);
          }
        }

        acc[part] = clsx(...classNames);

        return acc;
      }, {} as ClassNames<Parts>);
    });

    const styleOverrides = createMemo(() => {
      const configOverrides = styleConfigOverrides();

      if (configOverrides == null) {
        return {} as Styles<Parts>;
      }

      return parts.reduce((acc, part) => {
        const base = configOverrides[part]?.base ?? {};
        const variants = configOverrides[part]?.variants ?? ({} as any);
        const compoundVariants = configOverrides[part]?.compoundVariants ?? [];

        // 1. add "base" styles.
        const styles = [base];

        // 2. add "variants" styles.
        for (const name in selectedVariants()) {
          const value = selectedVariants()[name];

          if (value == null) {
            continue;
          }

          styles.push(variants[name]?.[String(value)]);
        }

        // 3. add "compound variants" styles.
        for (const compoundVariant of compoundVariants) {
          if (shouldApplyCompound(compoundVariant.variants, selectedVariants())) {
            styles.push(compoundVariant.style);
          }
        }

        acc[part] = mergeWith({}, ...styles);

        return acc;
      }, {} as Styles<Parts>);
    });

    return { classes, styleOverrides };
  };
}
