import { Property } from "csstype";

import { ColorTokens } from "../types";

/**
 * Utility props for setting color related styles
 */
export type ColorProps = Partial<{
  /**
   * The CSS `color` property
   */
  color: Property.Background<ColorTokens>;

  /**
   * The CSS `background` property
   */
  bg: Property.Background<ColorTokens>;

  /**
   * The CSS `opacity` property
   */
  opacity: Property.Opacity;
}>;
