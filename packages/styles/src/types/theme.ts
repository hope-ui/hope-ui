import type { DeepPartial } from "./deep-partial";
import { ClassNames, Styles } from "./styles";
import { ThemeBase, ThemeOther } from "./theme-base";

export interface ComponentTheme {
  defaultProps?: Record<string, any>;
  classNames?: ClassNames<string>;
  styles?: Styles<string, any>;
}

export interface Theme extends ThemeBase {
  components: Record<string, ComponentTheme>;
}

export type ThemeOverride = DeepPartial<Omit<Theme, "other" | "components" | "__breakpoints">> & {
  other?: ThemeOther;
  components?: Record<string, ComponentTheme>;
};
