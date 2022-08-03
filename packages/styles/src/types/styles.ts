import { SystemStyleObject } from "./system-style";
import { ThemeBase } from "./theme-base";

/** An object of classNames. */
export type ClassNames<ComponentParts extends string> = Partial<Record<ComponentParts, string>>;

/** An object or function that returns an object of styles. */
export type Styles<
  ComponentParts extends string,
  StyleParams extends Record<string, any> = never
> =
  | Partial<Record<ComponentParts, SystemStyleObject>>
  | ((theme: ThemeBase, params: StyleParams) => Partial<Record<ComponentParts, SystemStyleObject>>);
