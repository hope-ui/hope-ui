import { Property } from "csstype";

import { SizeTokens } from "../types";

/**
 * Utility props for setting component width and height
 */
export type SizeProps = Partial<{
  /**
   * The CSS `width` property
   */
  w: Property.Width<SizeTokens> | number;

  /**
   * The CSS `min-width` property
   */
  minW: Property.MinWidth<SizeTokens> | number;

  /**
   * The CSS `max-width` property
   */
  maxW: Property.MaxWidth<SizeTokens> | number;

  /**
   * The CSS `height` property
   */
  h: Property.Height<SizeTokens> | number;

  /**
   * The CSS `min-height` property
   */
  minH: Property.MinHeight<SizeTokens> | number;

  /**
   * The CSS `max-height` property
   */
  maxH: Property.MaxHeight<SizeTokens> | number;

  /**
   * The CSS `width` and `height` property
   */
  boxSize: Property.Width<SizeTokens> | number;
}>;
