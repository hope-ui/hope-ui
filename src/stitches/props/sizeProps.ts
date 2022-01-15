import { Property } from "csstype";

import { SizeTokens } from "../tokens/sizes";

export type SizeProps = Partial<{
  w: Property.Width<SizeTokens>;
  width: Property.Width<SizeTokens>;
  minW: Property.MinWidth<SizeTokens>;
  minWidth: Property.MinWidth<SizeTokens>;
  maxW: Property.MaxWidth<SizeTokens>;
  maxWidth: Property.MaxWidth<SizeTokens>;
  h: Property.Height<SizeTokens>;
  height: Property.Height<SizeTokens>;
  minH: Property.MinHeight<SizeTokens>;
  minHeight: Property.MinHeight<SizeTokens>;
  maxH: Property.MaxHeight<SizeTokens>;
  maxHeight: Property.MaxHeight<SizeTokens>;
  boxSize: Property.Height<SizeTokens>;
}>;

export type SizePropsKeys = keyof SizeProps;

/**
 * Array based on the `SizeProps`.
 * Used to splitProps in SolidJS components
 */
export const sizePropsKeys: SizePropsKeys[] = [
  "w",
  "width",
  "minW",
  "minWidth",
  "maxW",
  "maxWidth",
  "h",
  "height",
  "minH",
  "minHeight",
  "maxH",
  "maxHeight",
  "boxSize",
];
