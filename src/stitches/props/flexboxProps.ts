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

export type FlexboxPropsKeys = keyof FlexboxProps;

/**
 * Array based on the `FlexboxProps`.
 * Used to splitProps in SolidJS components
 */
export const flexboxPropsKeys: FlexboxPropsKeys[] = [
  "alignItems",
  "alignContent",
  "justifyItems",
  "justifyContent",
  "flexWrap",
  "flexDirection",
  "flex",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "justifySelf",
  "alignSelf",
  "order",
];
