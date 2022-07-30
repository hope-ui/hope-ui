import type { JSX } from "solid-js";

import type { CSSObject } from "./CSSObject";
import type { SystemStyleProps } from "./SystemStyleProps";
import type { HopeTheme } from "./HopeTheme";

export type Sx = CSSObject | ((theme: HopeTheme) => CSSObject);

export type ClassNames<StylesNames extends string> = Partial<Record<StylesNames, string>>;
export type Styles<StylesNames extends string, StylesParams extends Record<string, any> = never> =
  | Partial<Record<StylesNames, CSSObject>>
  | ((theme: HopeTheme, params: StylesParams) => Partial<Record<StylesNames, CSSObject>>);

export interface DefaultProps<
  StylesNames extends string = never,
  StylesParams extends Record<string, any> = never
> extends SystemStyleProps {
  className?: string;
  style?: JSX.CSSProperties;
  sx?: Sx | (Sx | undefined)[];
  classNames?: ClassNames<StylesNames>;
  styles?: Styles<StylesNames, StylesParams>;
  unstyled?: boolean;
}
