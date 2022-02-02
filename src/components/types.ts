import { PropsWithChildren } from "solid-js";

import { StyleProps } from "@/styled-system/system";
import { AsProp, ClassProps, ElementType, ExtendableProps, PropsOf } from "@/utils/types";

/**
 * Props of a Hope UI component.
 */
export type HopeComponentProps<C extends ElementType, Props = unknown> = ExtendableProps<
  PropsOf<C>,
  // `type` Props override StyleProps with same name
  PropsWithChildren<ExtendableProps<StyleProps, Props> & ClassProps & AsProp<C>>
>;
