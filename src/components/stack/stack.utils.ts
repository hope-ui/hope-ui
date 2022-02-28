import { Globals, Property } from "csstype";

import { BreakpointCssSelector, ResponsiveValue, SpaceScaleValue } from "@/styled-system/types";
import { isObject } from "@/utils/assertion";

type ResponsiveStackSpacing = {
  [Key in BreakpointCssSelector]: [
    Property.FlexDirection | undefined,
    Property.Gap<SpaceScaleValue> | number | undefined
  ];
};

/**
 * Check if the flex direction has change from `row` to `column` and vice-versa.
 */
function hasChangeDirection(
  currentDirection: Property.FlexDirection,
  previousDirection: Property.FlexDirection
): boolean {
  const wasRow = previousDirection === "row" || previousDirection === "row-reverse";
  const wasColumn = previousDirection === "column" || previousDirection === "column-reverse";

  const isRow = currentDirection === "row" || currentDirection === "row-reverse";
  const isColumn = currentDirection === "column" || currentDirection === "column-reverse";

  return (wasColumn && isRow) || (wasRow && isColumn);
}

/**
 * Check if the flex direction is `row`.
 */
function isRow(direction: Property.FlexDirection): boolean {
  return direction === "row" || direction === "row-reverse";
}

/**
 * Check if the flex direction is `column`.
 */
function isColumn(direction: Property.FlexDirection): boolean {
  return direction === "column" || direction === "column-reverse";
}

/**
 * Get `rowGap` and `columnGap` based on flex direction and spacing props.
 */
export function getSpacingStyles(
  direction: ResponsiveValue<Property.FlexDirection> | undefined,
  spacing: ResponsiveValue<SpaceScaleValue | number | string | "normal" | Globals> | undefined
) {
  const rowGap: ResponsiveValue<Property.RowGap<SpaceScaleValue> | number | undefined> = {};
  const columnGap: ResponsiveValue<Property.ColumnGap<SpaceScaleValue> | number | undefined> = {};

  const responsiveStackSpacing: ResponsiveStackSpacing = {
    "@initial": [undefined, undefined],
    "@sm": [undefined, undefined],
    "@md": [undefined, undefined],
    "@lg": [undefined, undefined],
    "@xl": [undefined, undefined],
    "@2xl": [undefined, undefined],
  };

  const breakpoints = Object.keys(responsiveStackSpacing) as BreakpointCssSelector[];

  if (isObject(direction) && isObject(spacing)) {
    // Both responsive
    breakpoints.forEach(bp => (responsiveStackSpacing[bp] = [direction[bp], spacing[bp]]));
  } else if (isObject(direction) && !isObject(spacing)) {
    // responsive direction, fixed spacing value
    breakpoints.forEach(bp => (responsiveStackSpacing[bp] = [direction[bp], spacing]));
  } else if (!isObject(direction) && isObject(spacing)) {
    // fixed direction value, responsive spacing
    breakpoints.forEach(bp => (responsiveStackSpacing[bp] = [direction, spacing[bp]]));
  } else if (!isObject(direction) && !isObject(spacing)) {
    // Both fixed values
    breakpoints.forEach(bp => (responsiveStackSpacing[bp] = [direction, spacing]));
  }

  let lastValidDirection: Property.FlexDirection = "initial";
  let lastValidSpacing: Property.Gap<SpaceScaleValue> | number = 0;

  breakpoints.forEach(bp => {
    const [dir, space] = responsiveStackSpacing[bp];

    const currentDirection = dir ?? lastValidDirection;
    const mainAxisSpacing = space ?? lastValidSpacing;
    const crossAxisSpacing = hasChangeDirection(currentDirection, lastValidDirection) ? 0 : undefined;

    if (isRow(currentDirection)) {
      rowGap[bp] = crossAxisSpacing;
      columnGap[bp] = mainAxisSpacing;
    } else if (isColumn(currentDirection)) {
      rowGap[bp] = mainAxisSpacing;
      columnGap[bp] = crossAxisSpacing;
    }

    if (dir != undefined) {
      lastValidDirection = dir;
    }

    if (space != undefined) {
      lastValidSpacing = space;
    }
  });

  return {
    rowGap,
    columnGap,
  };
}
