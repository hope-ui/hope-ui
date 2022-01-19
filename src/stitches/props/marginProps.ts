import { Property } from "csstype";

import { SpaceTokens } from "../types";

/**
 * Utility props for setting component margin
 */
export type MarginProps = Partial<{
  /**
   * Margin on top, left, bottom and right
   */
  m: Property.Margin<SpaceTokens> | number;

  /**
   * Margin on left and right
   */
  mx: Property.MarginInlineStart<SpaceTokens> | number;

  /**
   * Margin on top and bottom
   */
  my: Property.MarginTop<SpaceTokens> | number;

  /**
   * Margin on top
   */
  mt: Property.MarginTop<SpaceTokens> | number;

  /**
   * Margin on right
   */
  mr: Property.MarginRight<SpaceTokens> | number;

  /**
   * Margin on bottom
   */
  mb: Property.MarginBottom<SpaceTokens> | number;

  /**
   * Margin on left
   */
  ml: Property.MarginLeft<SpaceTokens> | number;
}>;
