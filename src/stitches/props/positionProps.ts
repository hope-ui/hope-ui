import { Property } from "csstype";

import { SpaceTokens } from "../tokens/space";
import { ZIndiceTokens } from "../tokens/zIndices";

export type PositionProps = Partial<{
  pos: Property.Position;
  position: Property.Position;
  zIndex: Property.ZIndex | ZIndiceTokens;
  top: Property.Top<SpaceTokens>;
  right: Property.Right<SpaceTokens>;
  left: Property.Left<SpaceTokens>;
  bottom: Property.Bottom<SpaceTokens>;
}>;

export type PositionPropsKeys = keyof PositionProps;

/**
 * Array based on the `PositionProps`.
 * Used to splitProps in SolidJS components
 */
export const positionPropsKeys: PositionPropsKeys[] = [
  "pos",
  "position",
  "zIndex",
  "top",
  "right",
  "left",
  "bottom",
];
