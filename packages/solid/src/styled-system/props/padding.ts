import { Property } from "csstype";

import { KeysOf, SpaceScaleValue } from "../types";

/**
 * Types for padding CSS properties
 */
export type PaddingProps = Partial<{
  /**
   * The CSS `padding` property
   */
  padding: Property.Padding<SpaceScaleValue> | number;

  /**
   * The CSS `padding` property
   */
  p: Property.Padding<SpaceScaleValue> | number;

  /**
   * The CSS `padding-top` property
   */
  paddingTop: Property.PaddingTop<SpaceScaleValue> | number;

  /**
   * The CSS `padding-top` property
   */
  pt: Property.PaddingTop<SpaceScaleValue> | number;

  /**
   * The CSS `padding-right` property
   */
  paddingRight: Property.PaddingRight<SpaceScaleValue> | number;

  /**
   * The CSS `padding-right` property
   */
  pr: Property.PaddingRight<SpaceScaleValue> | number;

  /**
   * The CSS `padding-inline-start`  property
   */
  paddingStart: Property.PaddingInlineStart<SpaceScaleValue> | number;

  /**
   * The CSS `padding-inline-start`  property
   */
  ps: Property.PaddingInlineStart<SpaceScaleValue> | number;

  /**
   * The CSS `padding-bottom` property
   */
  paddingBottom: Property.PaddingBottom<SpaceScaleValue> | number;

  /**
   * The CSS `padding-bottom` property
   */
  pb: Property.PaddingBottom<SpaceScaleValue> | number;

  /**
   * The CSS `padding-left`  property
   */
  paddingLeft: Property.PaddingLeft<SpaceScaleValue> | number;

  /**
   * The CSS `padding-left`  property
   */
  pl: Property.PaddingLeft<SpaceScaleValue> | number;

  /**
   * The CSS `padding-inline-end`  property
   */
  paddingEnd: Property.PaddingInlineEnd<SpaceScaleValue> | number;

  /**
   * The CSS `padding-inline-end`  property
   */
  pe: Property.PaddingInlineEnd<SpaceScaleValue> | number;

  /**
   * The CSS `padding-inline-start` and `padding-inline-end` property
   */
  px: Property.PaddingInlineStart<SpaceScaleValue> | number;

  /**
   * The CSS `padding-top` and `padding-bottom` property
   */
  py: Property.PaddingTop<SpaceScaleValue> | number;
}>;

/**
 * Style prop names for padding properties
 */
export const paddingPropNames: KeysOf<PaddingProps> = {
  padding: true,
  p: true,
  paddingTop: true,
  pt: true,
  paddingRight: true,
  pr: true,
  paddingStart: true,
  ps: true,
  paddingBottom: true,
  pb: true,
  paddingLeft: true,
  pl: true,
  paddingEnd: true,
  pe: true,
  px: true,
  py: true,
};
