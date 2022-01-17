import { Property } from "csstype";

import { ShadowTokens } from "../types";

export type ShadowProps = Partial<{
  textShadow: Property.TextShadow | ShadowTokens;
  shadow: Property.BoxShadow | ShadowTokens;
  boxShadow: Property.BoxShadow | ShadowTokens;
}>;
