import { Property } from "csstype";

import { SpaceTokens } from "../tokens/space";

export type PaddingProps = Partial<{
  p: Property.Padding<SpaceTokens> | number;
  padding: Property.Padding<SpaceTokens> | number;
  px: Property.PaddingInlineStart<SpaceTokens> | number;
  py: Property.PaddingTop<SpaceTokens> | number;
  pt: Property.PaddingTop<SpaceTokens> | number;
  paddingTop: Property.PaddingTop<SpaceTokens> | number;
  pr: Property.PaddingRight<SpaceTokens> | number;
  paddingRight: Property.PaddingRight<SpaceTokens> | number;
  pe: Property.PaddingInlineEnd<SpaceTokens> | number;
  paddingEnd: Property.PaddingInlineEnd<SpaceTokens> | number;
  pb: Property.PaddingBottom<SpaceTokens> | number;
  paddingBottom: Property.PaddingBottom<SpaceTokens> | number;
  pl: Property.PaddingLeft<SpaceTokens> | number;
  paddingLeft: Property.PaddingLeft<SpaceTokens> | number;
  ps: Property.PaddingInlineStart<SpaceTokens> | number;
  paddingStart: Property.PaddingInlineStart<SpaceTokens> | number;
}>;
