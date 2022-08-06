import { ClassProp } from "@hope-ui/utils";

import { SxProp, SystemStyleObject, SystemStyleProps } from "./styled-system";
import { UseStylesOptions } from "./styles";

/** Hope UI specific props. */
export interface HopeProps extends SystemStyleProps, SxProp, ClassProp {
  /**
   * The `__baseStyle` prop has the same API as the `sx` prop, but with a lower style priority.
   * Use it to apply base styles that can be overridden by `sx` and `system style` props.
   */
  __baseStyle?: SystemStyleObject;
}

/** Props of components that should supports the `Styles API` and `system style` props. */
export type DefaultProps<
  ComponentParts extends string = any,
  StylesParams extends Record<string, any> = any
> = Omit<HopeProps, "__baseStyle"> &
  Pick<UseStylesOptions<ComponentParts, StylesParams>, "styles" | "unstyled">;
