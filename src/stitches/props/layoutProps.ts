import { Property } from "csstype";

export type LayoutProps = Partial<{
  d: Property.Display;
  display: Property.Display;
  verticalAlign: Property.VerticalAlign;
  overflow: Property.Overflow;
  overflowX: Property.OverflowX;
  overflowY: Property.OverflowY;
}>;

export type LayoutPropsKeys = keyof LayoutProps;

/**
 * Array based on the `LayoutProps`.
 * Used to splitProps in SolidJS components
 */
export const layoutPropsKeys: LayoutPropsKeys[] = [
  "d",
  "display",
  "verticalAlign",
  "overflow",
  "overflowX",
  "overflowY",
];
