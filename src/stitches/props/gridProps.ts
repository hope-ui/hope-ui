import { Property } from "csstype";

import { SpaceTokens } from "../tokens/space";

export type GridProps = Partial<{
  gap: Property.Gap<SpaceTokens>;
  rowGap: Property.RowGap<SpaceTokens>;
  columnGap: Property.ColumnGap<SpaceTokens>;
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

export type GridPropsKeys = keyof GridProps;

/**
 * Array based on the `GridProps`.
 * Used to splitProps in SolidJS components
 */
export const gridPropsKeys: GridPropsKeys[] = [
  "gap",
  "rowGap",
  "columnGap",
  "gridColumn",
  "gridRow",
  "gridArea",
  "gridAutoFlow",
  "gridAutoRows",
  "gridAutoColumns",
  "gridTemplateRows",
  "gridTemplateColumns",
  "gridTemplateAreas",
];
