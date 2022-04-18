import { Property } from "csstype";

import { ColorScaleValue, KeysOf } from "../types";

/**
 * Types for color related CSS properties
 */
export type ColorProps = Partial<{
  /**
   * The CSS `color` property
   */
  color: Property.Color | ColorScaleValue;

  /**
   * The CSS `background` property
   */
  background: Property.Background<ColorScaleValue>;

  /**
   * The CSS `background` property
   */
  bg: Property.Background<ColorScaleValue>;

  /**
   * The CSS `background-color` property
   */
  backgroundColor: Property.BackgroundColor | ColorScaleValue;

  /**
   * The CSS `background-color` property
   */
  bgColor: Property.BackgroundColor | ColorScaleValue;

  /**
   * The CSS `opacity` property
   */
  opacity: Property.Opacity;
}>;

/**
 * Style prop names for color related properties
 */
export const colorPropNames: KeysOf<ColorProps> = {
  color: true,
  background: true,
  bg: true,
  backgroundColor: true,
  bgColor: true,
  opacity: true,
};
