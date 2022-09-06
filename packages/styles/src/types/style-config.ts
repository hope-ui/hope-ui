/*!
 * Original code by SEEK
 * MIT Licensed, Copyright (c) 2021 SEEK.
 *
 * Credits to the SEEK team:
 * https://github.com/seek-oss/vanilla-extract/blob/master/packages/recipes/src/types.ts
 */

import { Accessor } from "solid-js";

import { HopeProps, SystemStyleObject } from "./styled-system";
import { ThemeVarsAndBreakpoints } from "./vars";

/** String representation of `boolean` type. */
type BooleanStringUnion = "true" | "false";

/** Infer the type to `boolean` if it's a string union of `"true" | "false"`. */
export type BooleanMap<T> = T extends BooleanStringUnion ? boolean : T;

/** Infer the type to string union of `"true" | "false"` if it's a `boolean`. */
export type ReverseBooleanMap<T> = T extends boolean ? BooleanStringUnion : T;

/* -------------------------------------------------------------------------------------------------
 * StyleConfig
 * -----------------------------------------------------------------------------------------------*/

export type StyleConfigVariantSelection<Variants extends Record<string, any>> = {
  [VariantGroup in keyof Variants]?: BooleanMap<Variants[VariantGroup]>;
};

export interface StyleConfigCompoundVariant<Variants extends Record<string, any>> {
  /** The combined variants that should apply the styles. */
  variants: StyleConfigVariantSelection<Variants>;

  /** The style to be applied. */
  style: SystemStyleObject;
}

/** A style configuration. */
export interface StyleConfig<Variants extends Record<string, any>> {
  /** The base style. */
  baseStyle?: SystemStyleObject;

  /** The variants style. */
  variants?: {
    [K in keyof Variants]?: {
      [V in ReverseBooleanMap<Variants[K]>]?: SystemStyleObject;
    };
  };

  /** The combined variants style. */
  compoundVariants?: Array<StyleConfigCompoundVariant<Variants>>;
}

/** A multi-part style configuration. */
export type MultiPartStyleConfig<
  Parts extends string,
  Variants extends Record<string, any>
> = Record<Parts, StyleConfig<Variants>>;

/** An object or function that returns multipart style configuration. */
export type MultiPartStyleConfigInterpolation<
  Parts extends string,
  Variants extends Record<string, any>
> =
  | MultiPartStyleConfig<Parts, Variants>
  | ((theme: ThemeVarsAndBreakpoints) => MultiPartStyleConfig<Parts, Variants>);

/** An object or function that returns partial multipart style configuration. */
export type PartialMultiPartStyleConfigInterpolation<
  Parts extends string,
  Variants extends Record<string, any>
> =
  | Partial<MultiPartStyleConfig<Parts, Variants>>
  | ((theme: ThemeVarsAndBreakpoints) => Partial<MultiPartStyleConfig<Parts, Variants>>);

/* -------------------------------------------------------------------------------------------------
 * StyleConfigResult
 * -----------------------------------------------------------------------------------------------*/

/** ClassNames generated from a style configuration. */
export interface StyleConfigResult<Variants extends Record<string, any>> {
  /** The base className. */
  baseClassName?: string;

  /** The variants classNames. */
  variantClassNames?: {
    [K in keyof Variants]?: {
      [V in ReverseBooleanMap<Variants[K]>]?: string;
    };
  };

  /** The combined variants classNames. */
  compoundVariants?: Array<[StyleConfigVariantSelection<Variants>, string]>;
}

/** ClassNames generated from a multi-part style configuration. */
export type MultiPartStyleConfigResult<
  Parts extends string,
  Variants extends Record<string, any>
> = Record<Parts, StyleConfigResult<Variants>>;

/* -------------------------------------------------------------------------------------------------
 * UseStyleConfig
 * -----------------------------------------------------------------------------------------------*/

export type UseStyleConfigOptions<
  Parts extends string,
  Variants extends Record<string, any>
> = StyleConfigVariantSelection<Variants> & {
  /**
   * Styles that will be merged with the "base styles".
   * Mostly used to override/add additional styles.
   */
  styleConfig?: PartialMultiPartStyleConfigInterpolation<Parts, Variants>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
};

export interface UseStyleConfigReturn<Parts extends string> {
  /** An accessor of parts/classNames. */
  classes: Accessor<Record<Parts, string>>;

  /**
   * An accessor of parts/system style object intended to be passed to `__css` prop.
   * Mostly used to override/add additional styles.
   */
  styles: Accessor<Record<Parts, SystemStyleObject>>;
}

export type UseStyleConfigFn<Parts extends string, Variants extends Record<string, any>> = (
  name: string,
  options: UseStyleConfigOptions<Parts, Variants>
) => UseStyleConfigReturn<Parts>;

/* -------------------------------------------------------------------------------------------------
 * StyleConfigProps
 * -----------------------------------------------------------------------------------------------*/

/** Extract the option's type of `useStyleConfig` primitive. */
type StyleConfigOptionsOf<T extends UseStyleConfigFn<any, any>> = Parameters<T>[1];

/** Props of components that supports the `Style Config API` and `system style` props. */
export type StyleConfigProps<T extends UseStyleConfigFn<any, any>> = Omit<HopeProps, "__css"> &
  StyleConfigOptionsOf<T>;
