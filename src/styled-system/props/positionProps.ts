import { Property } from "csstype";

import { SpaceTokens, ZIndiceTokens } from "../types";

/**
 * Types for position CSS properties
 */
export type PositionProps = Partial<{
  /**
   * The CSS `position` property
   */
  position: Property.Position;

  /**
   * The CSS `z-index` property
   */
  zIndex: Property.ZIndex | ZIndiceTokens;

  /**
   * The CSS `top` property
   */
  top: Property.Top<SpaceTokens> | number;

  /**
   * The CSS `right` property
   */
  right: Property.Right<SpaceTokens> | number;

  /**
   * The CSS `bottom` property
   */
  bottom: Property.Bottom<SpaceTokens> | number;

  /**
   * The CSS `left` property
   */
  left: Property.Left<SpaceTokens> | number;
}>;
