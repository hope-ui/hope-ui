import { Property } from "csstype";

import { KeysOf, ThemeSpace } from "../../types";
import { ResponsiveProps } from "./responsive-value";

export type MarginProps = ResponsiveProps<{
  /** The CSS `margin` property. */
  m: Property.Margin<ThemeSpace> | number;

  /** The CSS `margin-top` property. */
  mt: Property.MarginTop<ThemeSpace> | number;

  /** The CSS `margin-right` property. */
  mr: Property.MarginRight<ThemeSpace> | number;

  /** The CSS `margin-bottom` property. */
  mb: Property.MarginBottom<ThemeSpace> | number;

  /** The CSS `margin-left`  property. */
  ml: Property.MarginLeft<ThemeSpace> | number;

  /** The CSS `margin-inline-start` and `margin-inline-end` property. */
  mx: Property.MarginInlineStart<ThemeSpace> | number;

  /** The CSS `margin-top` and `margin-bottom` property. */
  my: Property.MarginTop<ThemeSpace> | number;
}>;

export const marginPropNames: KeysOf<MarginProps> = {
  m: true,
  mt: true,
  mr: true,
  mb: true,
  ml: true,
  mx: true,
  my: true,
};
