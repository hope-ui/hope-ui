import { ClassProp } from "@hope-ui/utils";

import { UseStyleConfigFn } from "./style-config";
import { SxProp, SystemStyleObject, SystemStyleProps } from "./styled-system";

/** Hope UI specific props. */
export interface HopeProps extends SystemStyleProps, SxProp, ClassProp {
  /**
   * The `__css` prop has the same API as the `sx` prop, but with a lower style priority.
   * Use it to apply base styles that can be overridden by `sx` and `system style` props.
   */
  __css?: SystemStyleObject;
}

/** Extract the option's type of `useStyleConfig` primitive. */
type StyleConfigOptionsOf<T extends UseStyleConfigFn<any, any, any>> = Parameters<T>[0];

/** Props of components that supports the `Style Config API` and `system style` props. */
export type StyleConfigProps<T extends UseStyleConfigFn<any, any, any>> = HopeProps &
  Partial<StyleConfigOptionsOf<T>["variants"] & StyleConfigOptionsOf<T>["params"]> & {
    /**
     * Styles that will be merged with the "base styles" created by `createStyleConfig`.
     * Used to override/add additional styles.
     */
    styleConfig?: StyleConfigOptionsOf<T>["styleConfig"];

    /** Whether the base styles should be applied or not. */
    unstyled?: StyleConfigOptionsOf<T>["unstyled"];
  };
