import { Property } from "csstype";

import { SizeTokens } from "../tokens/sizes";

export type SizeProps = Partial<{
  w: Property.Width<SizeTokens> | number;
  width: Property.Width<SizeTokens> | number;
  minW: Property.MinWidth<SizeTokens> | number;
  minWidth: Property.MinWidth<SizeTokens> | number;
  maxW: Property.MaxWidth<SizeTokens> | number;
  maxWidth: Property.MaxWidth<SizeTokens> | number;
  h: Property.Height<SizeTokens> | number;
  height: Property.Height<SizeTokens> | number;
  minH: Property.MinHeight<SizeTokens> | number;
  minHeight: Property.MinHeight<SizeTokens> | number;
  maxH: Property.MaxHeight<SizeTokens> | number;
  maxHeight: Property.MaxHeight<SizeTokens> | number;
  boxSize: Property.Height<SizeTokens> | number;
}>;
