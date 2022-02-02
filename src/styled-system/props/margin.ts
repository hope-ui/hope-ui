import { Property } from "csstype";

import { SpaceScaleValue } from "@/theme/types";

import { KeysOf } from "../types";

/**
 * Types for margin CSS properties
 */
export type MarginProps = Partial<{
  /**
   * Margin on top, left, bottom and right
   */
  m: Property.Margin<SpaceScaleValue> | number;

  /**
   * Margin on left and right
   */
  mx: Property.MarginInlineStart<SpaceScaleValue> | number;

  /**
   * Margin on top and bottom
   */
  my: Property.MarginTop<SpaceScaleValue> | number;

  /**
   * Margin on top
   */
  mt: Property.MarginTop<SpaceScaleValue> | number;

  /**
   * Margin on right
   */
  mr: Property.MarginRight<SpaceScaleValue> | number;

  /**
   * Margin on bottom
   */
  mb: Property.MarginBottom<SpaceScaleValue> | number;

  /**
   * Margin on left
   */
  ml: Property.MarginLeft<SpaceScaleValue> | number;
}>;

/**
 * Style prop names for margin properties
 */
export const marginPropNames: KeysOf<MarginProps> = {
  m: true,
  mx: true,
  my: true,
  mt: true,
  mr: true,
  mb: true,
  ml: true,
};
