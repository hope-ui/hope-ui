/*!
 * Original code by SEEK
 * MIT Licensed, Copyright (c) 2021 SEEK.
 *
 * Credits to the SEEK team:
 * https://github.com/seek-oss/vanilla-extract/blob/master/packages/recipes/src/types.ts
 */

import { filterUndefined, runIfFn } from "@hope-ui/utils";
import { clsx } from "clsx";
import { Accessor, createMemo } from "solid-js";

import { computeStyle } from "./styled-system";
import { useTheme } from "./theme";
import { BooleanMap, SystemStyleObject, Theme, ThemeVars } from "./types";
import { shouldApplyCompound } from "./utils";

type VariantDefinitions = Record<string, SystemStyleObject>;

type VariantGroups = Record<string, VariantDefinitions>;

type VariantSelection<Variants extends VariantGroups> = {
  [VariantGroup in keyof Variants]?: BooleanMap<keyof Variants[VariantGroup]>;
};

interface CompoundVariant<Variants extends VariantGroups> {
  variants: VariantSelection<Variants>;
  style: SystemStyleObject;
}

type StyleOptions<Variants extends VariantGroups> = {
  base?: SystemStyleObject;
  variants?: Variants;
  compoundVariants?: Array<CompoundVariant<Variants>>;
  defaultVariants?: VariantSelection<Variants>;
};

type StyleOptionsInterpolation<Variants extends VariantGroups> =
  | StyleOptions<Variants>
  | ((vars: ThemeVars) => StyleOptions<Variants>);

type StyleResult<Variants extends VariantGroups> = {
  baseClassName: string;
  variantClassNames: {
    [K in keyof Variants]: {
      [V in keyof Variants[K]]: string;
    };
  };
  compoundVariants: Array<[VariantSelection<Variants>, string]>;
};

type UseStylesFn<Variants extends VariantGroups> = (
  options?: VariantSelection<Variants>
) => Accessor<string>;

export type VariantProps<T extends UseStylesFn<VariantGroups>> = Parameters<T>[0];

/** Compute classNames from a style options. */
function computeStyleOptions<Variants extends VariantGroups>(
  options: StyleOptions<Variants>,
  theme: Theme
): StyleResult<Variants> {
  const { base = {}, variants = {}, compoundVariants = [] } = options;

  return {
    baseClassName: computeStyle(base, theme),
    variantClassNames: Object.entries(variants).reduce((acc, [variant, definition]) => {
      // a variant (ex: "size")
      acc[variant] = Object.entries(definition as VariantDefinitions).reduce(
        (acc, [value, style]) => {
          // a variant value (ex: "sm")
          acc[value] = computeStyle(style, theme);
          return acc;
        },
        {} as any
      );
      return acc;
    }, {} as any),
    compoundVariants: compoundVariants.map(compoundVariant => [
      compoundVariant.variants,
      computeStyle(compoundVariant.style, theme),
    ]),
  };
}

/** Create a `useStyles` primitive. */
export function createStyles<Variants extends VariantGroups>(
  interpolation: StyleOptionsInterpolation<Variants>
): UseStylesFn<Variants> {
  let isFirstLoad = true;

  let styleOptions: StyleOptions<Variants>;
  let styleResult: StyleResult<Variants>;

  return function useStyles(variantSelection?: VariantSelection<Variants>) {
    const theme = useTheme();

    // Hack to make sure style config is computed only once for every component instance,
    // but has access to the current theme since `useStyles` run in a component context.
    if (isFirstLoad) {
      styleOptions = runIfFn(interpolation, theme.vars);
      styleResult = computeStyleOptions(styleOptions, theme);
      isFirstLoad = false;
    }

    const selectedVariants = createMemo(() => {
      return {
        ...styleOptions.defaultVariants,
        ...filterUndefined(variantSelection),
      } as VariantSelection<Variants>;
    });

    return createMemo(() => {
      const {
        baseClassName = "",
        variantClassNames = {} as any,
        compoundVariants = [],
      } = styleResult;

      // 1. add "base" classNames.
      const classNames = [baseClassName];

      // 2. add "variants" classNames.
      for (const name in selectedVariants()) {
        const value = selectedVariants()[name];

        if (value == null) {
          continue;
        }

        classNames.push(variantClassNames[name]?.[String(value)]);
      }

      // 3. add "compound variants" classNames.
      for (const [variants, className] of compoundVariants) {
        if (shouldApplyCompound(variants, selectedVariants())) {
          classNames.push(className);
        }
      }

      return clsx(...classNames);
    });
  };
}
