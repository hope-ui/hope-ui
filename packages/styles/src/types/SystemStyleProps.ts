import { Property } from "csstype";

import { HopeSize, HopeSpace } from "./HopeToken";

type MarginProps = Partial<{
  /** The CSS `margin` property. */
  m: Property.Margin<HopeSpace> | number;

  /** The CSS `margin-top` property. */
  mt: Property.MarginTop<HopeSpace> | number;

  /** The CSS `margin-right` property. */
  mr: Property.MarginRight<HopeSpace> | number;

  /** The CSS `margin-bottom` property. */
  mb: Property.MarginBottom<HopeSpace> | number;

  /** The CSS `margin-left`  property. */
  ml: Property.MarginLeft<HopeSpace> | number;

  /** The CSS `margin-inline-start` and `margin-inline-end` property. */
  mx: Property.MarginInlineStart<HopeSpace> | number;

  /** The CSS `margin-top` and `margin-bottom` property. */
  my: Property.MarginTop<HopeSpace> | number;
}>;

type PaddingProps = Partial<{
  /** The CSS `padding` property. */
  p: Property.Padding<HopeSpace> | number;

  /** The CSS `padding-top` property. */
  pt: Property.PaddingTop<HopeSpace> | number;

  /** The CSS `padding-right` property. */
  pr: Property.PaddingRight<HopeSpace> | number;

  /** The CSS `padding-bottom` property. */
  pb: Property.PaddingBottom<HopeSpace> | number;

  /** The CSS `padding-left`  property. */
  pl: Property.PaddingLeft<HopeSpace> | number;

  /** The CSS `padding-inline-start` and `padding-inline-end` property. */
  px: Property.PaddingInlineStart<HopeSpace> | number;

  /** The CSS `padding-top` and `padding-bottom` property. */
  py: Property.PaddingTop<HopeSpace> | number;
}>;

export type SizeProps = Partial<{
  /** The CSS `width` property. */
  w: Property.Width<HopeSize> | number;

  /** The CSS `min-width` property. */
  minW: Property.MinWidth<HopeSize> | number;

  /** The CSS `max-width` property. */
  maxW: Property.MaxWidth<HopeSize> | number;

  /** The CSS `height` property. */
  h: Property.Height<HopeSize> | number;

  /** The CSS `min-height` property. */
  minH: Property.MinHeight<HopeSize> | number;

  /** The CSS `max-height` property. */
  maxH: Property.MaxHeight<HopeSize> | number;

  /** The CSS `width` and `height` property. */
  boxSize: Property.Width<HopeSize> | number;
}>;

export type SystemStyleProps = MarginProps & PaddingProps & SizeProps;
