import { ClassProp } from "@hope-ui/utils";

import { SxProp, SystemStyleObject, SystemStyleProps } from "./styled-system";
import { UseStylesFn } from "./styles-config";

/** Hope UI specific props. */
export interface HopeProps extends SystemStyleProps, SxProp, ClassProp {
  /**
   * The `__css` prop has the same API as the `sx` prop, but with a lower style priority.
   * Use it to apply base styles that can be overridden by `sx` and `system style` props.
   */
  __css?: SystemStyleObject;
}

/** Extract the option's type of `useStyles` primitive. */
type StylesConfigOptionsOf<T extends UseStylesFn<any, any, any>> = Parameters<T>[0];

/** Props of components that supports the `Styles Config API` and `system style` props. */
export type StylesConfigProps<T extends UseStylesFn<any, any, any>> = HopeProps &
  Partial<StylesConfigOptionsOf<T>["variants"] & StylesConfigOptionsOf<T>["params"]> & {
    /**
     * Styles that will be merged with the "base styles" created by the `createStyles` call.
     * Mostly used to override/add additional styles.
     */
    styles?: StylesConfigOptionsOf<T>["styles"];

    /** Whether the base styles should be applied or not. */
    unstyled?: StylesConfigOptionsOf<T>["unstyled"];
  };
