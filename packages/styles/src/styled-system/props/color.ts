import { Property } from "csstype";

import { KeysOf } from "../../types";
import { ThemeColorShade } from "../../types/token";
import { ResponsiveProps } from "./responsive-value";

export type ColorProps = ResponsiveProps<{
  /** The CSS `color` property. */
  color: Property.Color | ThemeColorShade;

  /** The CSS `background` property. */
  bg: Property.Background<ThemeColorShade>;

  /** The CSS `background` property. */
  background: Property.Background<ThemeColorShade>;

  /** The CSS `background-color` property. */
  bgColor: Property.BackgroundColor | ThemeColorShade;

  /** The CSS `background-color` property. */
  backgroundColor: Property.BackgroundColor | ThemeColorShade;

  /** The CSS `opacity` property. */
  opacity: Property.Opacity;
}>;

export const colorPropNames: KeysOf<ColorProps> = {
  color: true,
  bg: true,
  background: true,
  bgColor: true,
  backgroundColor: true,
  opacity: true,
};
