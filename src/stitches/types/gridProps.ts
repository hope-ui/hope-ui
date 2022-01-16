import { Property } from "csstype";

import { SpaceTokens } from "../tokens/space";

export type GridProps = Partial<{
  gap: Property.Gap<SpaceTokens> | number;
  rowGap: Property.RowGap<SpaceTokens> | number;
  columnGap: Property.ColumnGap<SpaceTokens> | number;
  gridColumn: Property.GridColumn;
  gridRow: Property.GridRow;
  gridArea: Property.GridArea;
  gridAutoFlow: Property.GridAutoFlow;
  gridAutoRows: Property.GridAutoRows;
  gridAutoColumns: Property.GridAutoColumns;
  gridTemplateRows: Property.GridTemplateRows;
  gridTemplateColumns: Property.GridTemplateColumns;
  gridTemplateAreas: Property.GridTemplateAreas;
}>;
