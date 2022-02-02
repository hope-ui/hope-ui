import { Property } from "csstype";

import { SpaceScaleValue, ZIndiceScaleValue } from "@/theme/types";

import { KeysOf } from "../types";

/**
 * Types for position CSS properties
 */
export type PositionProps = Partial<{
  /**
   * The CSS `position` property
   */
  position: Property.Position;

  /**
   * The CSS `position` property
   */
  pos: Property.Position;

  /**
   * The CSS `z-index` property
   */
  zIndex: Property.ZIndex | ZIndiceScaleValue;

  /**
   * The CSS `top` property
   */
  top: Property.Top<SpaceScaleValue> | number;

  /**
   * The CSS `right` property
   */
  right: Property.Right<SpaceScaleValue> | number;

  /**
   * The CSS `bottom` property
   */
  bottom: Property.Bottom<SpaceScaleValue> | number;

  /**
   * The CSS `left` property
   */
  left: Property.Left<SpaceScaleValue> | number;
}>;

/**
 * Style prop names for position realted properties
 */
export const positionPropNames: KeysOf<PositionProps> = {
  position: true,
  pos: true,
  zIndex: true,
  top: true,
  right: true,
  bottom: true,
  left: true,
};
