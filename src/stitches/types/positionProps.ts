import { Property } from "csstype";

import { SpaceTokens } from "../tokens/space";
import { ZIndiceTokens } from "../tokens/zIndices";

export type PositionProps = Partial<{
  pos: Property.Position;
  position: Property.Position;
  zIndex: Property.ZIndex | ZIndiceTokens;
  top: Property.Top<SpaceTokens> | number;
  right: Property.Right<SpaceTokens> | number;
  left: Property.Left<SpaceTokens> | number;
  bottom: Property.Bottom<SpaceTokens> | number;
}>;
