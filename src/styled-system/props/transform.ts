import { Property } from "csstype";

import { KeysOf, SizeScaleValue } from "../types";

/**
 * Types for transform CSS properties.
 */
export type TransformProps = Partial<{
  /**
   * The CSS `transform` property.
   */
  transform: Property.Transform;

  /**
   * The CSS `transform-origin` property.
   */
  transformOrigin: Property.TransformOrigin<SizeScaleValue> | number;

  /**
   * The CSS `clip-path` property.
   *
   * It creates a clipping region that sets what part of an element should be shown.
   */
  clipPath: Property.ClipPath;
}>;

/**
 * Style prop names for transform CSS related properties.
 */
export const transformPropNames: KeysOf<TransformProps> = {
  transform: true,
  transformOrigin: true,
  clipPath: true,
};
