import type { DeepPartial } from "./deep-partial";
import { Styles } from "./styles";
import { ThemeBase, ThemeOther } from "./theme-base";

export interface ComponentTheme {
  defaultProps?: Record<string, any>;
  styles?: Styles<string, any>;
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
