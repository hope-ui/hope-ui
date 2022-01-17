import { Property } from "csstype";

import { SpaceTokens } from "../types";

export type SpacingProps = Partial<{
  spaceX: Property.MarginLeft<SpaceTokens> | number;
  spaceY: Property.MarginTop<SpaceTokens> | number;
}>;
