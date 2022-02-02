import { Property } from "csstype";

import { SpaceScaleValue } from "@/theme/types";

import { KeysOf } from "../types";

/**
 * Types for padding CSS properties
 */
export type PaddingProps = Partial<{
  /**
   * Padding on top, left, bottom and right
   */
  p: Property.Padding<SpaceScaleValue> | number;

  /**
   * Padding on left and right
   */
  px: Property.PaddingInlineStart<SpaceScaleValue> | number;

  /**
   * Padding on top and bottom
   */
  py: Property.PaddingTop<SpaceScaleValue> | number;

  /**
   * Padding on top
   */
  pt: Property.PaddingTop<SpaceScaleValue> | number;

  /**
   * Padding on right
   */
  pr: Property.PaddingRight<SpaceScaleValue> | number;

  /**
   * Padding on bottom
   */
  pb: Property.PaddingBottom<SpaceScaleValue> | number;

  /**
   * Padding on left
   */
  pl: Property.PaddingLeft<SpaceScaleValue> | number;
}>;

/**
 * Style prop names for padding properties
 */
export const paddingPropNames: KeysOf<PaddingProps> = {
  p: true,
  px: true,
  py: true,
  pt: true,
  pr: true,
  pb: true,
  pl: true,
};
