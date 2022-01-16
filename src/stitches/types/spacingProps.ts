import { Property } from "csstype";

import { SpaceTokens } from "../tokens/space";

export type SpacingProps = Partial<{
  spaceX: Property.MarginLeft<SpaceTokens> | number;
  spaceY: Property.MarginTop<SpaceTokens> | number;
}>;
