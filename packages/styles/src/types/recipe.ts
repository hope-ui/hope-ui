import { Accessor } from "solid-js";

import { SystemStyleObject } from "./styled-system";
import { ThemeBase } from "./theme-base";

type BooleanMap<T> = T extends "true" | "false" ? boolean : T;

/** An object of recipe parts/styles object. */
export type RecipeStylesObjects<Parts extends string> = Record<Parts, SystemStyleObject>;

/** An object of recipe parts/classNames. */
export type RecipeClassNames<Parts extends string> = Record<Parts, string | undefined>;

export type GetStaticClass<Parts extends string> = (part: Parts) => string;

export type VariantDefinitions<Parts extends string> = Record<
  string,
  Partial<RecipeStylesObjects<Parts>>
>;

export type VariantGroups<Parts extends string> = Record<string, VariantDefinitions<Parts>>;

export type VariantSelection<Parts extends string, Variants extends VariantGroups<Parts>> = {
  [VariantGroup in keyof Variants]?: BooleanMap<keyof Variants[VariantGroup]>;
};

export interface CompoundVariant<Parts extends string, Variants extends VariantGroups<Parts>> {
  /** The combined variants that should apply the styles. */
  variants: VariantSelection<Parts, Variants>;

  /** The styles to be applied. */
  style: Partial<RecipeStylesObjects<Parts>>;
}

/** An recipe configuration. */
export type RecipeConfig<Parts extends string, Variants extends VariantGroups<Parts>> = {
  /** The parts of the recipe/component. */
  parts: Array<Parts>;

  /** The base styles of each part. */
  base?: Partial<RecipeStylesObjects<Parts>>;

  /** The variants style of each part. */
  variants?: Variants;

  /** The combined variants style of each part. */
  compoundVariants?: Array<CompoundVariant<Parts, Variants>>;

  /** The default variants to use. */
  defaultVariants?: VariantSelection<Parts, Variants>;
};

/** An object or function that returns a recipe configuration. */
export type RecipeConfigInterpolation<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
> =
  | RecipeConfig<Parts, Variants>
  | ((
      theme: ThemeBase,
      params: Params,
      getStaticClass: GetStaticClass<Parts>
    ) => RecipeConfig<Parts, Variants>);

export interface UseRecipeOptions<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
> {
  /** The name of the component, used to retrieve theme styles and generating static classNames. */
  name?: string;

  /** Dynamic params that will be passed to the recipe. */
  params: Params;

  /** The recipe variants, used to determine which classNames should be applied. */
  variants?: VariantSelection<Parts, Variants>;

  /**
   * Styles that will be merged with the "base styles" created by the `createStyles` call.
   * Mostly used to override/add additional styles.
   */
  styles?: RecipeConfigInterpolation<Parts, Params, Variants>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
}

export type UseRecipeFn<
  Parts extends string,
  Params extends Record<string, any>,
  Variants extends VariantGroups<Parts>
> = (options: UseRecipeOptions<Parts, Params, Variants>) => Accessor<RecipeClassNames<Parts>>;

/** Extract the option's type of `useRecipe` primitive. */
export type RecipeOptions<RecipeFn extends UseRecipeFn<any, any, any>> = Parameters<RecipeFn>[0];
