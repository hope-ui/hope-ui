/*!
 * Original code by SEEK
 * MIT Licensed, Copyright (c) 2021 SEEK.
 *
 * Credits to the SEEK team:
 * https://github.com/seek-oss/vanilla-extract/blob/master/packages/recipes/src/types.ts
 */

import { Accessor } from "solid-js";

import { SystemStyleObject } from "./styled-system";
import { ThemeVars } from "./theme";

type BooleanMap<T> = T extends "true" | "false" ? boolean : T;

/** An object of styles parts/style objects. */
export type StylesObjects<Parts extends string> = Record<Parts, SystemStyleObject>;

export type VariantDefinitions<Parts extends string> = Record<
  string,
  Partial<StylesObjects<Parts>>
>;

export type VariantGroups<Parts extends string> = Record<string, VariantDefinitions<Parts>>;

export type VariantSelection<Parts extends string, Variants extends VariantGroups<Parts>> = {
  [VariantGroup in keyof Variants]?: BooleanMap<keyof Variants[VariantGroup]>;
};

export interface CompoundVariant<Parts extends string, Variants extends VariantGroups<Parts>> {
  /** The combined variants that should apply the styles. */
  variants: VariantSelection<Parts, Variants>;

  /** The styles to be applied. */
  style: Partial<StylesObjects<Parts>>;
}

/** A styles configuration. */
export type StylesConfig<Parts extends string, Variants extends VariantGroups<Parts>> = {
  /** The parts of the recipe/component. */
  parts: Array<Parts>;

  /** The base styles of each part. */
  base?: Partial<StylesObjects<Parts>>;

  /** The variants style of each part. */
  variants?: Variants;

  /** The combined variants style of each part. */
  compoundVariants?: Array<CompoundVariant<Parts, Variants>>;

  /** The default variants to use. */
  defaultVariants?: VariantSelection<Parts, Variants>;
};

/** An object or function that returns styles configuration. */
export type StylesConfigInterpolation<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
> =
  | StylesConfig<Parts, Variants>
  | ((vars: ThemeVars, params: Params) => StylesConfig<Parts, Variants>);

/** An object or function that returns partial styles configuration. */
export type PartialStylesConfigInterpolation<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
> =
  | Partial<StylesConfig<Parts, Variants>>
  | ((vars: ThemeVars, params: Params) => Partial<StylesConfig<Parts, Variants>>);

export interface UseStylesOptions<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
> {
  /** The name of the component, used to retrieve theme styles. */
  name?: string;

  /** Dynamic params that will be passed to the `useStyles` call. */
  params: Params;

  /** The variants used to determine which style should be applied. */
  variants?: VariantSelection<Parts, Variants>;

  /**
   * Styles that will be merged with the "base styles" created by the `createStyles` call.
   * Mostly used to override/add additional styles.
   */
  styles?: PartialStylesConfigInterpolation<Parts, Params, Variants>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
}

export type UseStylesFn<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
> = (options: UseStylesOptions<Parts, Params, Variants>) => Accessor<StylesObjects<Parts>>;
