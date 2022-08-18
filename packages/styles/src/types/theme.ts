import { DeepPartial } from "./deep-partial";
import { StyleConfigOverrideInterpolation } from "./style-config";
import { ThemeBase, ThemeMetaData } from "./theme-base";

export interface ComponentTheme<
  Props extends Record<string, any> = {},
  StyleConfigOverride extends StyleConfigOverrideInterpolation<any, any> | undefined = any
> {
  /** Default props to be passed to the component. */
  defaultProps?: Props;

  /**
   * Styles that will be merged with the "base styles" created by `createStyleConfig`.
   * Used to override/add additional styles.
   */
  styleConfigOverride?: StyleConfigOverride;
}

export interface Theme extends ThemeBase, ThemeMetaData {
  components: Record<string, ComponentTheme>;
}

export type ThemeOverride = DeepPartial<Omit<Theme, "components" | keyof ThemeMetaData>> & {
  components?: Record<string, ComponentTheme>;
};
