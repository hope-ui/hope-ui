import type { CSSObject } from "../types/css-object";
import type { Theme } from "../types/theme";
import { SystemStyleProps } from "./system";

export type ClassNames<StylesNames extends string> = Partial<Record<StylesNames, string>>;

export type Styles<StylesNames extends string, VariantProps extends Record<string, any> = never> =
  | Partial<Record<StylesNames, CSSObject>>
  | ((theme: Theme, variants: VariantProps) => Partial<Record<StylesNames, CSSObject>>);

export interface DefaultProps<
  StylesNames extends string = never,
  VariantProps extends Record<string, any> = never
> extends SystemStyleProps {
  /** The css class applied to the root of the component. */
  class?: string;

  /** The classNames applied to each parts of the component. */
  classNames?: ClassNames<StylesNames>;

  /** The styles applied to each parts of the component, will be parsed by `emotion` and added to the head. */
  styles?: Styles<StylesNames, VariantProps>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
}
