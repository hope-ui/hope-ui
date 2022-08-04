import type { DeepPartial } from "./deep-partial";
import { ThemeBase, ThemeOther } from "./theme-base";
import { Styles } from "./styles-api";

export interface ComponentTheme {
  defaultProps?: Record<string, any>;
  styles?: Styles<string, any>;
}

export interface Theme extends ThemeBase {
  components: Record<string, ComponentTheme>;
}

export type ThemeOverride = DeepPartial<Omit<Theme, "other" | "components" | "__breakpoints">> & {
  other?: ThemeOther;
  components?: Record<string, ComponentTheme>;
};
