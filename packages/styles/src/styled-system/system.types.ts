import { OverrideProps } from "@hope-ui/utils";

import { CSSObject, Theme } from "../types";
import { SystemStyleProps } from "./props";

export type SystemStyleObject = OverrideProps<CSSObject, SystemStyleProps>;

export type Sx = SystemStyleObject | ((theme: Theme) => SystemStyleObject);

export type ClassNames<StyleNames extends string> = Partial<Record<StyleNames, string>>;

export type Styles<StyleNames extends string, StyleParams extends Record<string, any> = never> =
  | Partial<Record<StyleNames, SystemStyleObject>>
  | ((theme: Theme, params: StyleParams) => Partial<Record<StyleNames, SystemStyleObject>>);

export interface DefaultProps<
  StyleNames extends string = never,
  StyleParams extends Record<string, any> = never
> extends SystemStyleProps {
  /** The css class applied to the root of the component. */
  class?: string;

  /** The style applied to the root element, will be parsed by `emotion` and added to the head. */
  sx?: Sx | (Sx | undefined)[];

  /** The classNames applied to each parts of the component. */
  classNames?: ClassNames<StyleNames>;

  /** The styles applied to each parts of the component, will be parsed by `emotion` and added to the head. */
  styles?: Styles<StyleNames, StyleParams>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
}
