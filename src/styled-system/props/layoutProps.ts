import { Property } from "csstype";

export type LayoutProps = Partial<{
  d: Property.Display;
  display: Property.Display;
  verticalAlign: Property.VerticalAlign;
  overflow: Property.Overflow;
  overflowX: Property.OverflowX;
  overflowY: Property.OverflowY;
}>;
