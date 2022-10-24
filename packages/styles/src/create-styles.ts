/*!
 * Original code by SEEK
 * MIT Licensed, Copyright (c) 2021 SEEK.
 *
 * Credits to the SEEK team:
 * https://github.com/seek-oss/vanilla-extract/blob/master/packages/recipes/src/createRuntimeFn.ts
 */

import { filterUndefined, once, runIfFn } from "@hope-ui/utils";
import { clsx } from "clsx";
import { Accessor, createMemo } from "solid-js";

import { computeStyle } from "./styled-system/compute-style";
import { useTheme } from "./theme";
import { BooleanMap, SystemStyleObject, Theme, ThemeVarsAndBreakpoints } from "./types";
import { shouldApplyCompound } from "./utils/should-apply-compound";

type HopeVariantDefinitions = Record<string, SystemStyleObject>;

export type HopeVariantGroups = Record<string, HopeVariantDefinitions>;

export type HopeVariantSelection<Variants extends HopeVariantGroups> = {
  [VariantGroup in keyof Variants]?: BooleanMap<keyof Variants[VariantGroup]>;
};

interface HopeCompoundVariant<Variants extends HopeVariantGroups> {
  /** The combined variants that should apply the style. */
  variants: HopeVariantSelection<Variants>;

  /** The style to be applied. */
  style: SystemStyleObject;
}

export interface HopeStyleOptions<Variants extends HopeVariantGroups> {
  /** The base style. */
  baseStyle?: SystemStyleObject;

  /**
   * The variants style.
   * Each variant will become a `prop` of the component.
   */
  variants?: Variants;

  /** The combined variants style. */
  compoundVariants?: Array<HopeCompoundVariant<Variants>>;

  /** The default value for each variant. */
  defaultVariants?: HopeVariantSelection<Variants>;
}

export type HopeStyleOptionsInterpolation<Variants extends HopeVariantGroups> =
  | HopeStyleOptions<Variants>
  | ((theme: ThemeVarsAndBreakpoints) => HopeStyleOptions<Variants>);

export type HopeStyleResult<Variants extends HopeVariantGroups> = {
  baseClassName: string;
  variantClassNames: {
    [K in keyof Variants]: {
      [V in keyof Variants[K]]: string;
    };
  };
  compoundVariants: Array<[HopeVariantSelection<Variants>, string]>;
};

type UseStylesFn<Variants extends HopeVariantGroups> = (
  variantProps?: HopeVariantSelection<Variants>
) => Accessor<string>;

/** Extract the variant props type of `useStyles` primitive. */
export type HopeVariantProps<T extends UseStylesFn<any>> = Parameters<T>[0];

/** Compute classNames from a hope style options. */
export function computeStyleOptions<Variants extends HopeVariantGroups>(
  options: HopeStyleOptions<Variants>,
  theme: Theme
): HopeStyleResult<Variants> {
  const { baseStyle = {}, variants = {}, compoundVariants = [] } = options;

  return {
    baseClassName: computeStyle(baseStyle, theme),
    variantClassNames: Object.entries(variants).reduce((acc, [variant, definition]) => {
      // a variant (ex: "size")
      acc[variant] = Object.entries(definition as HopeVariantDefinitions).reduce(
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

/** Get the variants classNames of selected variants. */
export function getSelectedVariantClassNames<Variants extends HopeVariantGroups>(
  styleResult: HopeStyleResult<Variants>,
  selectedVariants: HopeVariantSelection<Variants>
): Array<string> {
  const { variantClassNames = {} as any, compoundVariants = [] } = styleResult;

  const classNames: Array<string> = [];

  // 1. add "variants" classNames.
  for (const name in selectedVariants) {
    const value = selectedVariants[name];

    if (value == null) {
      continue;
    }

    classNames.push(variantClassNames[name]?.[String(value)]);
  }

  // 2. add "compound variants" classNames.
  for (const [variants, className] of compoundVariants) {
    if (shouldApplyCompound(variants, selectedVariants)) {
      classNames.push(className);
    }
  }

  return classNames;
}

/** Create a `useStyles` primitive. */
export function createStyles<Variants extends HopeVariantGroups = {}>(
  interpolation: HopeStyleOptionsInterpolation<Variants>
): UseStylesFn<Variants> {
  let styleOptions: HopeStyleOptions<Variants> | undefined;
  let styleResult: HopeStyleResult<Variants> | undefined;

  const runOnce = once((theme: Theme) => {
    styleOptions = runIfFn(interpolation, theme);
    styleResult = computeStyleOptions(styleOptions, theme);
  });

  return function useStyles(variantProps: HopeVariantSelection<Variants> = {}) {
    const theme = useTheme();

    // generate classNames once.
    runOnce(theme);

    const classes: Accessor<string> = createMemo(() => {
      if (styleOptions == null || styleResult == null) {
        return "";
      }

      const selectedVariants = {
        ...styleOptions.defaultVariants,
        ...filterUndefined(variantProps),
      } as HopeVariantSelection<Variants>;

      const variantClassNames = getSelectedVariantClassNames(styleResult, selectedVariants);

      return clsx(styleResult.baseClassName, variantClassNames);
    });

    return classes;
  };
}
