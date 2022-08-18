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
