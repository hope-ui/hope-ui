import type { DeepPartial } from "./deep-partial";
import { RecipeConfigInterpolation, VariantGroups } from "./recipe";
import { ThemeBase, ThemeOther } from "./theme-base";

export interface ComponentTheme<
  Props extends Record<string, any> = {},
  Parts extends string = string,
  Params extends Record<string, any> = {},
  Variants extends VariantGroups<Parts> = {}
> {
  /** Default props to be passed to the component. */
  defaultProps?: Props;

  /**
   * Styles that will be merged with the "base styles" of the component.
   * Mostly used to override/add additional styles.
   */
  styles?: RecipeConfigInterpolation<Parts, Params, Variants>;
}

export interface Theme extends ThemeBase {
  components: Record<string, ComponentTheme>;
}

export type ThemeWithoutMetaData = Omit<Theme, "fn" | "__breakpoints">;

export type ThemeOverride = DeepPartial<
  Omit<Theme, "fn" | "other" | "components" | "__breakpoints">
> & {
  other?: ThemeOther;
  components?: Record<string, ComponentTheme>;
};
