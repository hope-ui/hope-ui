import { ThemeStyleObject } from "@/theme/types";

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
      row: { gridAutoFlow: "row" } as ThemeStyleObject,
      "row-dense": { gridAutoFlow: "row dense" } as ThemeStyleObject,
      column: { gridAutoFlow: "column" } as ThemeStyleObject,
      "column-dense": { gridAutoFlow: "column dense" } as ThemeStyleObject,
    },
    gridAutoColumns: {
      auto: { gridAutoColumns: "auto" } as ThemeStyleObject,
      min: { gridAutoColumns: "min-content" } as ThemeStyleObject,
      max: { gridAutoColumns: "max-content" } as ThemeStyleObject,
      fr: { gridAutoColumns: " minmax(0, 1fr)" } as ThemeStyleObject,
    },
    gridAutoRows: {
      auto: { gridAutoRows: "auto" } as ThemeStyleObject,
      min: { gridAutoRows: "min-content" } as ThemeStyleObject,
      max: { gridAutoRows: "max-content" } as ThemeStyleObject,
      fr: { gridAutoRows: " minmax(0, 1fr)" } as ThemeStyleObject,
    },
    ...oneToTwelve.reduce(
      (acc, val) => ({
        gridTemplateColumns: {
          ...acc.gridTemplateColumns,
          [val]: { gridTemplateColumns: `repeat(${val}, minmax(0, 1fr))` } as ThemeStyleObject,
        },
        gridTemplateRows: {
          ...acc.gridTemplateRows,
          [val]: { gridTemplateRows: `repeat(${val}, minmax(0, 1fr))` } as ThemeStyleObject,
        },
        gridColumnSpan: {
          ...acc.gridColumnSpan,
          [val]: { gridColumn: `span ${val} / span ${val}` } as ThemeStyleObject,
        },
        gridRowSpan: {
          ...acc.gridRowSpan,
          [val]: { gridRow: `span ${val} / span ${val}` } as ThemeStyleObject,
        },
        gridColumnStart: {
          ...acc.gridColumnStart,
          [val]: { gridColumnStart: val } as ThemeStyleObject,
        },
        gridColumnEnd: {
          ...acc.gridColumnEnd,
          [val]: { gridColumnEnd: val } as ThemeStyleObject,
        },
        gridRowStart: {
          ...acc.gridRowStart,
          [val]: { gridRowEnd: val } as ThemeStyleObject,
        },
        gridRowEnd: {
          ...acc.gridRowEnd,
          [val]: { gridRowEnd: val } as ThemeStyleObject,
        },
      }),
      {} as GridUtilityVariants
    ),
  };

  gridUtilities.gridTemplateColumns.none = { gridTemplateColumns: "none" } as ThemeStyleObject;
  gridUtilities.gridTemplateRows.none = { gridTemplateRows: "none" } as ThemeStyleObject;

  gridUtilities.gridColumnSpan.auto = { gridColumn: "auto" } as ThemeStyleObject;
  gridUtilities.gridColumnSpan.full = { gridColumn: "1 / -1" } as ThemeStyleObject;

  gridUtilities.gridRowSpan.auto = { gridRow: "auto" } as ThemeStyleObject;
  gridUtilities.gridRowSpan.full = { gridRow: "1 / -1" } as ThemeStyleObject;

  gridUtilities.gridColumnStart["13"] = { gridColumnStart: "13" } as ThemeStyleObject;
  gridUtilities.gridColumnEnd["13"] = { gridColumnEnd: "13" } as ThemeStyleObject;
  gridUtilities.gridColumnStart.auto = { gridColumnStart: "auto" } as ThemeStyleObject;
  gridUtilities.gridColumnEnd.auto = { gridColumnEnd: "auto" } as ThemeStyleObject;

  gridUtilities.gridRowStart["13"] = { gridRowStart: "13" } as ThemeStyleObject;
  gridUtilities.gridRowEnd["13"] = { gridRowEnd: "13" } as ThemeStyleObject;
  gridUtilities.gridRowStart.auto = { gridRowStart: "auto" } as ThemeStyleObject;
  gridUtilities.gridRowEnd.auto = { gridRowEnd: "auto" } as ThemeStyleObject;

  return gridUtilities;
}
