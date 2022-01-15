import { Property } from "csstype";

import { SpaceTokens } from "../tokens/space";

export type PaddingProps = Partial<{
  p: Property.Padding<SpaceTokens>;
  padding: Property.Padding<SpaceTokens>;
  px: Property.PaddingInlineStart<SpaceTokens>;
  py: Property.PaddingTop<SpaceTokens>;
  pt: Property.PaddingTop<SpaceTokens>;
  paddingTop: Property.PaddingTop<SpaceTokens>;
  pr: Property.PaddingRight<SpaceTokens>;
  paddingRight: Property.PaddingRight<SpaceTokens>;
  pe: Property.PaddingInlineEnd<SpaceTokens>;
  paddingEnd: Property.PaddingInlineEnd<SpaceTokens>;
  pb: Property.PaddingBottom<SpaceTokens>;
  paddingBottom: Property.PaddingBottom<SpaceTokens>;
  pl: Property.PaddingLeft<SpaceTokens>;
  paddingLeft: Property.PaddingLeft<SpaceTokens>;
  ps: Property.PaddingInlineStart<SpaceTokens>;
  paddingStart: Property.PaddingInlineStart<SpaceTokens>;
}>;

export type PaddingPropsKeys = keyof PaddingProps;

/**
 * Array based on the `PaddingProps`.
 * Used to splitProps in SolidJS components
 */
export const paddingPropsKeys: PaddingPropsKeys[] = [
  "p",
  "padding",
  "px",
  "py",
  "pt",
  "paddingTop",
  "pr",
  "paddingRight",
  "pe",
  "paddingEnd",
  "pb",
  "paddingBottom",
  "pl",
  "paddingLeft",
  "ps",
  "paddingStart",
];
