import { Property } from "csstype";

import { KeysOf, ThemeSpace } from "../../types";
import { ThemeZIndice } from "../../types/token";
import { ResponsiveProps } from "./responsive-value";

export type PositionProps = ResponsiveProps<{
  /** The CSS `position` property. */
  position: Property.Position;

  /** The CSS `z-index` property. */
  zIndex: Property.ZIndex | ThemeZIndice;

  /** The CSS `top` property. */
  top: Property.Top<ThemeSpace> | number;

  /** The CSS `right` property. */
  right: Property.Right<ThemeSpace> | number;

  /** The CSS `bottom` property. */
  bottom: Property.Bottom<ThemeSpace> | number;

  /** The CSS `left` property. */
  left: Property.Left<ThemeSpace> | number;
}>;

export const positionPropNames: KeysOf<PositionProps> = {
  position: true,
  zIndex: true,
  top: true,
  right: true,
  bottom: true,
  left: true,
};
