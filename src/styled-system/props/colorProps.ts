import { Property } from "csstype";

import { ColorTokens } from "../types";

/**
 * Types for color related CSS properties
 */
export type ColorProps = Partial<{
  /**
   * The CSS `color` property
   */
  color: Property.Color | ColorTokens;

  /**
   * The CSS `background` property
   */
  bg: Property.Background<ColorTokens>;

  /**
   * The CSS `opacity` property
   */
  opacity: Property.Opacity;
}>;
