import { ClassProps } from "@hope-ui/utils";

import { SxProp, SystemStyleObject, SystemStyleProps } from "./styled-system";
import { Styles } from "./styles";

/** Hope UI specific props. */
export interface HopeProps extends SystemStyleProps, SxProp, ClassProps {
  /**
   * The `__baseStyle` prop has the same API as the `sx` prop, but with a lower style priority.
   * Use it to apply base styles that can be overridden by `sx` and `system style` props.
   */
  __baseStyle?: SystemStyleObject;
}

/** Props of components that should supports the `Styles API` and `system style` props. */
export interface DefaultProps<
  StylesNames extends string = any,
  StylesParams extends Record<string, any> = any
> extends Omit<HopeProps, "__baseStyle"> {
  /** The styles to apply to the component. */
  styles?: Styles<StylesNames, StylesParams>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
}
