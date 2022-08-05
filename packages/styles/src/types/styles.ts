import { SystemStyleObject } from "./styled-system";
import { ThemeBase } from "./theme-base";

/** An object or function that returns an object of styles. */
export type Styles<StylesNames extends string, StylesParams extends Record<string, any> = never> =
  | Partial<Record<StylesNames, SystemStyleObject>>
  | ((theme: ThemeBase, params: StylesParams) => Partial<Record<StylesNames, SystemStyleObject>>);
