import type { DeepPartial } from "./deep-partial";
import { PartialStyles } from "./styles";
import { ThemeBase, ThemeOther } from "./theme-base";

export interface ComponentTheme<
  Props extends Record<string, any> = {},
  ComponentParts extends string = string,
  StylesParams extends Record<string, any> = {}
> {
  /** Default props to be passed to the component. */
  defaultProps?: Props;

  /**
   * Styles that will be merged with the "base styles" of the component.
   * Mostly used to override/add additional styles.
   */
  styles?: PartialStyles<ComponentParts, StylesParams>;
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
