import { ClassNames, Styles } from "./styles";
import { SxProp, SystemStyleProps } from "./system-style";

export interface DefaultProps<
  ComponentParts extends string = any,
  StyleParams extends Record<string, any> = any
> extends SystemStyleProps,
    SxProp {
  /** The css class applied to the root of the component. */
  class?: string;

  /** The classNames applied to each parts of the component. */
  classNames?: ClassNames<ComponentParts>;

  /** The styles applied to each parts of the component, will be parsed by `stitches` and added to the head. */
  styles?: Styles<ComponentParts, StyleParams>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
}
