import { Property } from "csstype";

import { KeysOf, SizeScaleValue } from "../types";

/**
 * Types for size related CSS properties
 */
export type SizeProps = Partial<{
  /**
   * The CSS `width` property
   */
  width: Property.Width<SizeScaleValue> | number;

  /**
   * The CSS `width` property
   */
  w: Property.Width<SizeScaleValue> | number;

  /**
   * The CSS `min-width` property
   */
  minWidth: Property.MinWidth<SizeScaleValue> | number;

  /**
   * The CSS `min-width` property
   */
  minW: Property.MinWidth<SizeScaleValue> | number;

  /**
   * The CSS `max-width` property
   */
  maxWidth: Property.MaxWidth<SizeScaleValue> | number;

  /**
   * The CSS `max-width` property
   */
  maxW: Property.MaxWidth<SizeScaleValue> | number;

  /**
   * The CSS `height` property
   */
  height: Property.Height<SizeScaleValue> | number;

  /**
   * The CSS `height` property
   */
  h: Property.Height<SizeScaleValue> | number;

  /**
   * The CSS `min-height` property
   */
  minHeight: Property.MinHeight<SizeScaleValue> | number;

  /**
   * The CSS `min-height` property
   */
  minH: Property.MinHeight<SizeScaleValue> | number;

  /**
   * The CSS `max-height` property
   */
  maxHeight: Property.MaxHeight<SizeScaleValue> | number;

  /**
   * The CSS `max-height` property
   */
  maxH: Property.MaxHeight<SizeScaleValue> | number;

  /**
   * The CSS `width` and `height` property
   */
  boxSize: Property.Width<SizeScaleValue> | number;
}>;

/**
 * Style prop names for sizes properties
 */
export const sizePropNames: KeysOf<SizeProps> = {
  width: true,
  w: true,
  minWidth: true,
  minW: true,
  maxWidth: true,
  maxW: true,
  height: true,
  h: true,
  minHeight: true,
  minH: true,
  maxHeight: true,
  maxH: true,
  boxSize: true,
};
