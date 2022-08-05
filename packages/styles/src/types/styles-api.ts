import { SystemStyleObject } from "./styled-system";
import { ThemeBase } from "./theme-base";

/** An object or function that returns an object of styles. */
export type Styles<
  ComponentParts extends string,
  StyleParams extends Record<string, any> = never
> =
  | Partial<Record<ComponentParts, SystemStyleObject>>
  | ((theme: ThemeBase, params: StyleParams) => Partial<Record<ComponentParts, SystemStyleObject>>);

/** Props of component using the Styles API (`createStyles`). */
export interface StylesProps<
  ComponentParts extends string = any,
  StyleParams extends Record<string, any> = any
> {
  /** The styles applied to each component parts. */
  styles?: Styles<ComponentParts, StyleParams>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
}
