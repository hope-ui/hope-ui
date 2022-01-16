import { Property } from "csstype";

import { ShadowTokens } from "../tokens/shadows";

export type ShadowProps = Partial<{
  textShadow: Property.TextShadow | ShadowTokens;
  shadow: Property.BoxShadow | ShadowTokens;
  boxShadow: Property.BoxShadow | ShadowTokens;
}>;
