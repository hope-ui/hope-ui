import { Property } from "csstype";

import { SpaceTokens } from "../tokens/space";

export type MarginProps = Partial<{
  m: Property.Margin<SpaceTokens>;
  margin: Property.Margin<SpaceTokens>;
  mx: Property.MarginInlineStart<SpaceTokens>;
  my: Property.MarginTop<SpaceTokens>;
  mt: Property.MarginTop<SpaceTokens>;
  marginTop: Property.MarginTop<SpaceTokens>;
  mr: Property.MarginRight<SpaceTokens>;
  marginRight: Property.MarginRight<SpaceTokens>;
  me: Property.MarginInlineEnd<SpaceTokens>;
  marginEnd: Property.MarginInlineEnd<SpaceTokens>;
  mb: Property.MarginBottom<SpaceTokens>;
  marginBottom: Property.MarginBottom<SpaceTokens>;
  ml: Property.MarginLeft<SpaceTokens>;
  marginLeft: Property.MarginLeft<SpaceTokens>;
  ms: Property.MarginInlineStart<SpaceTokens>;
  marginStart: Property.MarginInlineStart<SpaceTokens>;
}>;

export type MarginPropsKeys = keyof MarginProps;

/**
 * Array based on the `MarginProps`.
 * Used to splitProps in SolidJS components
 */
export const marginPropsKeys: MarginPropsKeys[] = [
  "m",
  "margin",
  "mx",
  "my",
  "mt",
  "marginTop",
  "mr",
  "marginRight",
  "me",
  "marginEnd",
  "mb",
  "marginBottom",
  "ml",
  "marginLeft",
  "ms",
  "marginStart",
];
