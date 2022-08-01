import { Property } from "csstype";

import { KeysOf, ThemeSize } from "../../types";
import { ResponsiveProps } from "./responsive-value";

export type SizeProps = ResponsiveProps<{
  /** The CSS `width` property. */
  w: Property.Width<ThemeSize> | number;

  /** The CSS `min-width` property. */
  minW: Property.MinWidth<ThemeSize> | number;

  /** The CSS `max-width` property. */
  maxW: Property.MaxWidth<ThemeSize> | number;

  /** The CSS `height` property. */
  h: Property.Height<ThemeSize> | number;

  /** The CSS `min-height` property. */
  minH: Property.MinHeight<ThemeSize> | number;

  /** The CSS `max-height` property. */
  maxH: Property.MaxHeight<ThemeSize> | number;

  /** The CSS `width` and `height` property. */
  boxSize: Property.Width<ThemeSize> | number;
}>;

export const sizePropNames: KeysOf<SizeProps> = {
  w: true,
  minW: true,
  maxW: true,
  h: true,
  minH: true,
  maxH: true,
  boxSize: true,
};
