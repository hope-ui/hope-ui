import { Property } from "csstype";

import { ColorTokens } from "../types";

export type ColorProps = Partial<{
  color: Property.Color | ColorTokens;
  opacity: Property.Opacity;
}>;
