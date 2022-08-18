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

/** An object of style config parts/system style object. */
export type StyleObjects<Parts extends string> = Record<Parts, SystemStyleObject>;

/** An object of style config parts/className. */
export type ClassNameObjects<Parts extends string> = Record<Parts, string>;

export type VariantSelection<VariantDefinitions extends Record<string, any>> = {
  [VariantName in keyof VariantDefinitions]?: BooleanMap<VariantDefinitions[VariantName]>;
};

export interface CompoundVariant<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> {
  /** The combined variants that should apply the styles. */
  variants: VariantSelection<VariantDefinitions>;

  /** The styles to be applied. */
  styles: Partial<StyleObjects<Parts>>;
}

type Variants<Parts extends string, T extends Record<string, any>> = {
  [K in keyof T]?: {
    [V in ReverseBooleanMap<T[K]>]?: Partial<StyleObjects<Parts>>;
  };
};

/** A style configuration. */
export interface StyleConfig<Parts extends string, VariantDefinitions extends Record<string, any>> {
  /**
   * The base styles of each part.
   * Note: if a part doesn't need base style just put an empty object.
   * @example
   * {
   *   root: {
   *     background: "primary.500",
   *   },
   *   icon: {},
   * }
   */
  baseStyles: StyleObjects<Parts>;

  /** The variants style of each part. */
  variants?: Variants<Parts, VariantDefinitions>;

  /** The combined variants style of each part. */
  compoundVariants?: Array<CompoundVariant<Parts, VariantDefinitions>>;

  /** The default variants to use. */
  defaultVariants?: VariantSelection<VariantDefinitions>;
}

/** An object or function that returns style configuration. */
export type StyleConfigInterpolation<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> =
  | StyleConfig<Parts, VariantDefinitions>
  | ((vars: ThemeVars) => StyleConfig<Parts, VariantDefinitions>);

/** A style configuration used for theming and component level styles overrides. */
export type StyleConfigOverride<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> = Omit<StyleConfig<Parts, VariantDefinitions>, "baseStyles" | "defaultVariants"> & {
  /** The base styles of each part. */
  baseStyles?: Partial<StyleObjects<Parts>>;
};

/** An object or function that returns style configuration overrides. */
export type StyleConfigOverrideInterpolation<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> =
  | StyleConfigOverride<Parts, VariantDefinitions>
  | ((vars: ThemeVars) => StyleConfigOverride<Parts, VariantDefinitions>);

type VariantsClassNames<Parts extends string, T extends Record<string, any>> = {
  [K in keyof T]?: {
    [V in ReverseBooleanMap<T[K]>]?: Partial<ClassNameObjects<Parts>>;
  };
};

export interface CompoundVariantClassNames<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> {
  /** The combined variants that should apply the classNames. */
  variants: VariantSelection<VariantDefinitions>;

  /** The classNames to be applied. */
  classNames: Partial<ClassNameObjects<Parts>>;
}

export interface StyleConfigClassNames<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> {
  /** The base classNames of each part. */
  baseClassNames: Partial<ClassNameObjects<Parts>>;

  /** The variants classNames of each part. */
  variants: VariantsClassNames<Parts, VariantDefinitions>;

  /** The combined variants classNames of each part. */
  compoundVariants: Array<CompoundVariantClassNames<Parts, VariantDefinitions>>;
}

export type UseStyleConfigOptions<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> = VariantSelection<VariantDefinitions> & {
  /**
   * Styles that will be merged with the "base styles" created by `createStyleConfig`.
   * Mostly used to override/add additional styles.
   */
  styleConfigOverride?: StyleConfigOverrideInterpolation<Parts, VariantDefinitions>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
};

export interface UseStyleConfigReturn<Parts extends string> {
  classes: Accessor<ClassNameObjects<Parts>>;
  styles: Accessor<StyleObjects<Parts>>;
}

export type UseStyleConfigFn<
  Parts extends string,
  VariantDefinitions extends Record<string, any>
> = (
  name: string,
  options: UseStyleConfigOptions<Parts, VariantDefinitions>
) => UseStyleConfigReturn<Parts>;
