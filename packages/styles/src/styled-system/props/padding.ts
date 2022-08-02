import { Property } from "csstype";

import { KeysOf, ThemeSpace } from "../../types";
import { ResponsiveProps } from "./responsive-value";

export type PaddingProps = ResponsiveProps<{
  /** The CSS `padding` property. */
  padding: Property.Padding<ThemeSpace> | number;

  /** The CSS `padding-top` property. */
  paddingTop: Property.PaddingTop<ThemeSpace> | number;

  /** The CSS `padding-right` property. */
  paddingRight: Property.PaddingRight<ThemeSpace> | number;

  /** The CSS `padding-bottom` property. */
  paddingBottom: Property.PaddingBottom<ThemeSpace> | number;

  /** The CSS `padding-left`  property. */
  paddingLeft: Property.PaddingLeft<ThemeSpace> | number;

  /** The CSS `padding` property. */
  p: Property.Padding<ThemeSpace> | number;

  /** The CSS `padding-top` property. */
  pt: Property.PaddingTop<ThemeSpace> | number;

  /** The CSS `padding-right` property. */
  pr: Property.PaddingRight<ThemeSpace> | number;

  /** The CSS `padding-bottom` property. */
  pb: Property.PaddingBottom<ThemeSpace> | number;

  /** The CSS `padding-left`  property. */
  pl: Property.PaddingLeft<ThemeSpace> | number;

  /** The CSS `padding-inline-start` and `padding-inline-end` property. */
  px: Property.PaddingInlineStart<ThemeSpace> | number;

  /** The CSS `padding-top` and `padding-bottom` property. */
  py: Property.PaddingTop<ThemeSpace> | number;
}>;

export const paddingPropNames: KeysOf<PaddingProps> = {
  padding: true,
  paddingTop: true,
  paddingRight: true,
  paddingBottom: true,
  paddingLeft: true,
  p: true,
  pt: true,
  pr: true,
  pb: true,
  pl: true,
  px: true,
  py: true,
};
