import { Property } from "csstype";

import { SpaceTokens } from "../tokens/space";

export type MarginProps = Partial<{
  m: Property.Margin<SpaceTokens> | number;
  margin: Property.Margin<SpaceTokens> | number;
  mx: Property.MarginInlineStart<SpaceTokens> | number;
  my: Property.MarginTop<SpaceTokens> | number;
  mt: Property.MarginTop<SpaceTokens> | number;
  marginTop: Property.MarginTop<SpaceTokens> | number;
  mr: Property.MarginRight<SpaceTokens> | number;
  marginRight: Property.MarginRight<SpaceTokens> | number;
  me: Property.MarginInlineEnd<SpaceTokens> | number;
  marginEnd: Property.MarginInlineEnd<SpaceTokens> | number;
  mb: Property.MarginBottom<SpaceTokens> | number;
  marginBottom: Property.MarginBottom<SpaceTokens> | number;
  ml: Property.MarginLeft<SpaceTokens> | number;
  marginLeft: Property.MarginLeft<SpaceTokens> | number;
  ms: Property.MarginInlineStart<SpaceTokens> | number;
  marginStart: Property.MarginInlineStart<SpaceTokens> | number;
}>;
