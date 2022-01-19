import { Property } from "csstype";

import { SpaceTokens } from "../types";

/**
 * Types for padding CSS properties
 */
export type PaddingProps = Partial<{
  /**
   * Padding on top, left, bottom and right
   */
  p: Property.Padding<SpaceTokens> | number;

  /**
   * Padding on left and right
   */
  px: Property.PaddingInlineStart<SpaceTokens> | number;

  /**
   * Padding on top and bottom
   */
  py: Property.PaddingTop<SpaceTokens> | number;

  /**
   * Padding on top
   */
  pt: Property.PaddingTop<SpaceTokens> | number;

  /**
   * Padding on right
   */
  pr: Property.PaddingRight<SpaceTokens> | number;

  /**
   * Padding on bottom
   */
  pb: Property.PaddingBottom<SpaceTokens> | number;

  /**
   * Padding on left
   */
  pl: Property.PaddingLeft<SpaceTokens> | number;
}>;
