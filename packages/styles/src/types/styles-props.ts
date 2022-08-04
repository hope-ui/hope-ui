import { ClassNames, Styles } from "./styles";

/** Props of component using the Styles API (`createStyles`). */
export interface StylesProps<
  ComponentParts extends string = any,
  StyleParams extends Record<string, any> = any
> {
  /** The classNames applied to each component parts. */
  classNames?: ClassNames<ComponentParts>;

  /** The styles applied to each component parts, will be parsed by `stitches` and added to the head. */
  styles?: Styles<ComponentParts, StyleParams>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
}
