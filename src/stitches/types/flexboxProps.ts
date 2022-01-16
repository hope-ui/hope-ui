import { Property } from "csstype";

export type FlexboxProps = Partial<{
  alignItems: Property.AlignItems;
  alignContent: Property.AlignContent;
  justifyItems: Property.JustifyItems;
  justifyContent: Property.JustifyContent;
  flexWrap: Property.FlexWrap;
  flexDirection: Property.FlexDirection;
  flex: Property.Flex;
  flexGrow: Property.FlexGrow;
  flexShrink: Property.FlexShrink;
  flexBasis: Property.FlexBasis;
  justifySelf: Property.JustifySelf;
  alignSelf: Property.AlignSelf;
  order: Property.Order;
}>;
