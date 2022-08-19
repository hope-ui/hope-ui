/*!
 * Original code by SEEK
 * MIT Licensed, Copyright (c) 2021 SEEK.
 *
 * Credits to the SEEK team:
 * https://github.com/seek-oss/vanilla-extract/blob/master/packages/recipes/src/types.ts
 */

import { Accessor } from "solid-js";

import { SystemStyleObject } from "./styled-system";
import { ThemeVars } from "./vars";

/** String representation of `boolean` type. */
type BooleanStringUnion = "true" | "false";

/** Infer the type to `boolean` if it's a string union of `"true" | "false"`. */
type BooleanMap<T> = T extends BooleanStringUnion ? boolean : T;

/** Infer the type to string union of `"true" | "false"` if it's a `boolean`. */
type ReverseBooleanMap<T> = T extends boolean ? BooleanStringUnion : T;

export type VariantSelection<VariantDefinitions extends Record<string, any>> = {
  [VariantName in keyof VariantDefinitions]?: BooleanMap<VariantDefinitions[VariantName]>;
};

export type Variants<T extends Record<string, any>> = {
  [K in keyof T]?: {
    [V in ReverseBooleanMap<T[K]>]?: SystemStyleObject;
  };
};

export interface CompoundVariant<VariantDefinitions extends Record<string, any>> {
  /** The combined variants that should apply the styles. */
  variants: VariantSelection<VariantDefinitions>;

  /** The styles to be applied. */
  style: SystemStyleObject;
}

/** A style configuration. */
export interface StyleConfig<VariantDefinitions extends Record<string, any>> {
  /** The base style. */
  base?: SystemStyleObject;

  /** The variants style. */
  variants?: Variants<VariantDefinitions>;

  /** The combined variants style. */
  compoundVariants?: Array<CompoundVariant<VariantDefinitions>>;
}

// ---

/** Style configurations for multi-parts components. */
export type MultiPartStyleConfig<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> = Record<Parts, StyleConfig<VariantDefinitions>>;

/** An object or function that returns multi-parts style configuration. */
export type MultiPartStyleConfigInterpolation<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> =
  | MultiPartStyleConfig<Parts, VariantDefinitions>
  | ((vars: ThemeVars) => MultiPartStyleConfig<Parts, VariantDefinitions>);

/** An object or function that returns partial multi-parts style configuration. */
export type PartialMultiPartStyleConfigInterpolation<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> =
  | Partial<MultiPartStyleConfig<Parts, VariantDefinitions>>
  | ((vars: ThemeVars) => Partial<MultiPartStyleConfig<Parts, VariantDefinitions>>);

// ---

export type VariantsClassNames<T extends Record<string, any>> = {
  [K in keyof T]?: {
    [V in ReverseBooleanMap<T[K]>]?: string;
  };
};

export interface CompoundVariantClassNames<VariantDefinitions extends Record<string, any>> {
  /** The combined variants that should apply the className. */
  variants: VariantSelection<VariantDefinitions>;

  /** The className to be applied. */
  className: string;
}

/** ClassNames generated from a style configuration. */
export interface StyleConfigResult<VariantDefinitions extends Record<string, any>> {
  /** The base className. */
  base?: string;

  /** The variants classNames. */
  variants?: VariantsClassNames<VariantDefinitions>;

  /** The combined variants classNames. */
  compoundVariants?: Array<CompoundVariantClassNames<VariantDefinitions>>;
}

/** Style configuration classNames for multi-parts components. */
export type MultiPartStyleConfigResult<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> = Record<Parts, StyleConfigResult<VariantDefinitions>>;

// ---

/** An object of classNames. */
export type ClassNames<Parts extends string> = Record<Parts, string>;

/** An object system style objects. */
export type Styles<Parts extends string> = Record<Parts, SystemStyleObject>;

export type UseStyleConfigOptions<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> = VariantSelection<VariantDefinitions> & {
  /**
   * Styles that will be merged with the "base styles".
   * Mostly used to override/add additional styles.
   */
  styleConfigOverrides?: PartialMultiPartStyleConfigInterpolation<Parts, VariantDefinitions>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
};

export interface UseStyleConfigReturn<Parts extends string> {
  classes: Accessor<ClassNames<Parts>>;
  styleOverrides: Accessor<Styles<Parts>>;
}

export type UseStyleConfigFn<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> = (
  name: string,
  options: UseStyleConfigOptions<Parts, VariantDefinitions>
) => UseStyleConfigReturn<Parts>;
