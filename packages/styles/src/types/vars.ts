import { ColorSystem } from "./color-system";
import { ThemeScales } from "./scales";

/** An object with the same shape as `ThemeScales` but with css variables reference as value. */
export type ThemeVars = {
  [Scale in keyof Omit<ThemeScales, "colors">]: {
    [Token in keyof ThemeScales[Scale]]: string;
  };
} & {
  colors: ColorSystem;
};

export interface ThemeVarsAndBreakpoints {
  /** All theme tokens as CSS variables reference (e.g. `var(--xxx)`). */
  vars: ThemeVars;

  /** All theme breakpoints values, useful for defining `@media` queries since it doesn't support CSS variables. */
  breakpoints: ThemeScales["breakpoints"];
}
