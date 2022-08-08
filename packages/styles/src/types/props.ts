import { ClassProp } from "@hope-ui/utils";

import { SxProp, SystemStyleObject, SystemStyleProps } from "./styled-system";
import { PartialStylesInterpolation } from "./styles";

/** Hope UI specific props. */
export interface HopeProps extends SystemStyleProps, SxProp, ClassProp {
  /**
   * The `__css` prop has the same API as the `sx` prop, but with a lower style priority.
   * Use it to apply base styles that can be overridden by `sx` and `system style` props.
   */
  __css?: SystemStyleObject;
}

/** Props of components that should supports the `Styles API` and `system style` props. */
export interface DefaultProps<
  ComponentParts extends string = never,
  StylesParams extends Record<string, any> = never
> extends Omit<HopeProps, "__baseStyle"> {
  /**
   * Styles that will be merged with the "base styles" created by the `createStyles` call.
   * Mostly used to override/add additional styles.
   */
  styles?: PartialStylesInterpolation<ComponentParts, StylesParams>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
}
