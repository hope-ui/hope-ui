import { Property } from "csstype";

import { ColorScaleValue } from "@/theme/types";

import { KeysOf } from "../types";

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
  bg: Property.Background<ColorScaleValue>;

  /**
   * The CSS `background-color` property
   */
  bgColor: Property.Background<ColorScaleValue>;

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
  bg: true,
  bgColor: true,
  opacity: true,
};
