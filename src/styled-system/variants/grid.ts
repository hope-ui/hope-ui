import { SystemStyleObject } from "@/theme";

import { UtilityVariant } from "../types";

const oneToTwelve = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

type OneToTwelveRange = typeof oneToTwelve[number];

type GridTemplateVariant = UtilityVariant<OneToTwelveRange | "none">;
type GridSpanVariant = UtilityVariant<OneToTwelveRange | "auto" | "full">;
type GridStartEndVariant = UtilityVariant<OneToTwelveRange | "13" | "auto">;

interface GridUtilityVariants {
  gridTemplateColumns: GridTemplateVariant;
  gridTemplateRows: GridTemplateVariant;

  gridColumnSpan: GridSpanVariant;
  gridRowSpan: GridSpanVariant;

  gridColumnStart: GridStartEndVariant;
  gridColumnEnd: GridStartEndVariant;
  gridRowStart: GridStartEndVariant;
  gridRowEnd: GridStartEndVariant;
}

export function createGridUtilityVariants() {
  const gridUtilities = {
    gridAutoFlow: {
      row: { gridAutoFlow: "row" } as SystemStyleObject,
      "row-dense": { gridAutoFlow: "row dense" } as SystemStyleObject,
      column: { gridAutoFlow: "column" } as SystemStyleObject,
      "column-dense": { gridAutoFlow: "column dense" } as SystemStyleObject,
    },
    gridAutoColumns: {
      auto: { gridAutoColumns: "auto" } as SystemStyleObject,
      min: { gridAutoColumns: "min-content" } as SystemStyleObject,
      max: { gridAutoColumns: "max-content" } as SystemStyleObject,
      fr: { gridAutoColumns: " minmax(0, 1fr)" } as SystemStyleObject,
    },
    gridAutoRows: {
      auto: { gridAutoRows: "auto" } as SystemStyleObject,
      min: { gridAutoRows: "min-content" } as SystemStyleObject,
      max: { gridAutoRows: "max-content" } as SystemStyleObject,
      fr: { gridAutoRows: " minmax(0, 1fr)" } as SystemStyleObject,
    },
    ...oneToTwelve.reduce(
      (acc, val) => ({
        gridTemplateColumns: {
          ...acc.gridTemplateColumns,
          [val]: { gridTemplateColumns: `repeat(${val}, minmax(0, 1fr))` } as SystemStyleObject,
        },
        gridTemplateRows: {
          ...acc.gridTemplateRows,
          [val]: { gridTemplateRows: `repeat(${val}, minmax(0, 1fr))` } as SystemStyleObject,
        },
        gridColumnSpan: {
          ...acc.gridColumnSpan,
          [val]: { gridColumn: `span ${val} / span ${val}` } as SystemStyleObject,
        },
        gridRowSpan: {
          ...acc.gridRowSpan,
          [val]: { gridRow: `span ${val} / span ${val}` } as SystemStyleObject,
        },
        gridColumnStart: {
          ...acc.gridColumnStart,
          [val]: { gridColumnStart: val } as SystemStyleObject,
        },
        gridColumnEnd: {
          ...acc.gridColumnEnd,
          [val]: { gridColumnEnd: val } as SystemStyleObject,
        },
        gridRowStart: {
          ...acc.gridRowStart,
          [val]: { gridRowEnd: val } as SystemStyleObject,
        },
        gridRowEnd: {
          ...acc.gridRowEnd,
          [val]: { gridRowEnd: val } as SystemStyleObject,
        },
      }),
      {} as GridUtilityVariants
    ),
  };

  gridUtilities.gridTemplateColumns.none = { gridTemplateColumns: "none" } as SystemStyleObject;
  gridUtilities.gridTemplateRows.none = { gridTemplateRows: "none" } as SystemStyleObject;

  gridUtilities.gridColumnSpan.auto = { gridColumn: "auto" } as SystemStyleObject;
  gridUtilities.gridColumnSpan.full = { gridColumn: "1 / -1" } as SystemStyleObject;

  gridUtilities.gridRowSpan.auto = { gridRow: "auto" } as SystemStyleObject;
  gridUtilities.gridRowSpan.full = { gridRow: "1 / -1" } as SystemStyleObject;

  gridUtilities.gridColumnStart["13"] = { gridColumnStart: "13" } as SystemStyleObject;
  gridUtilities.gridColumnEnd["13"] = { gridColumnEnd: "13" } as SystemStyleObject;
  gridUtilities.gridColumnStart.auto = { gridColumnStart: "auto" } as SystemStyleObject;
  gridUtilities.gridColumnEnd.auto = { gridColumnEnd: "auto" } as SystemStyleObject;

  gridUtilities.gridRowStart["13"] = { gridRowStart: "13" } as SystemStyleObject;
  gridUtilities.gridRowEnd["13"] = { gridRowEnd: "13" } as SystemStyleObject;
  gridUtilities.gridRowStart.auto = { gridRowStart: "auto" } as SystemStyleObject;
  gridUtilities.gridRowEnd.auto = { gridRowEnd: "auto" } as SystemStyleObject;

  return gridUtilities;
}
