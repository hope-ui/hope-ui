import { Property } from "csstype";

import { ColorTokens } from "../tokens/colors";

export type ColorProps = Partial<{
  color: Property.Color | ColorTokens;
  opacity: Property.Opacity;
}>;
