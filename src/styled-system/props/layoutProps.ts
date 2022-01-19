import { Property } from "csstype";

/**
 * Types for layout related CSS properties
 */
export type LayoutProps = Partial<{
  /**
   * The CSS `display` property
   */
  display: Property.Display;

  /**
   * The CSS `vertical-align` property
   */
  verticalAlign: Property.VerticalAlign;

  /**
   * The CSS `overflow` property
   */
  overflow: Property.Overflow;

  /**
   * The CSS `overflow-x` property
   */
  overflowX: Property.OverflowX;

  /**
   * The CSS `overflow-y` property
   */
  overflowY: Property.OverflowY;
}>;
