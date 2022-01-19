import { Property } from "csstype";

import { SpaceTokens, ZIndiceTokens } from "../types";

export type PositionProps = Partial<{
  position: Property.Position;
  zIndex: Property.ZIndex | ZIndiceTokens;
  top: Property.Top<SpaceTokens> | number;
  right: Property.Right<SpaceTokens> | number;
  left: Property.Left<SpaceTokens> | number;
  bottom: Property.Bottom<SpaceTokens> | number;
}>;
