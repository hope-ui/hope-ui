import { Property } from "csstype";

import { KeysOf } from "../../types";
import { ResponsiveProps } from "./responsive-value";

export type LayoutProps = ResponsiveProps<{
  /** The CSS `display` property. */
  d: Property.Display;

  /** The CSS `display` property. */
  display: Property.Display;

  /** The CSS `vertical-align` property. */
  verticalAlign: Property.VerticalAlign;

  /** The CSS `overflow` property. */
  overflow: Property.Overflow;

  /** The CSS `overflow-x` property. */
  overflowX: Property.OverflowX;

  /** The CSS `overflow-y` property. */
  overflowY: Property.OverflowY;
}>;

export const layoutPropNames: KeysOf<LayoutProps> = {
  d: true,
  display: true,
  verticalAlign: true,
  overflow: true,
  overflowX: true,
  overflowY: true,
};
