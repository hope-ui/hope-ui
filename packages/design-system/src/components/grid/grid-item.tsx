import { Property } from "csstype";
import { splitProps } from "solid-js";

import { ResponsiveProps, ResponsiveValue } from "../../styled-system/types";
import { classNames, createClassSelector } from "../../utils/css";
import { mapKeys } from "../../utils/function";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";

type GridSpanValue = string | number | "auto" | "full";

export type GridItemOptions = ResponsiveProps<{
  area?: Property.GridArea;
  colSpan?: GridSpanValue;
  colStart?: Property.GridColumnStart;
  colEnd?: Property.GridColumnEnd;
  rowSpan?: GridSpanValue;
  rowStart?: Property.GridRowStart;
  rowEnd?: Property.GridRowEnd;
}>;

export type GridItemProps<C extends ElementType = "div"> = HTMLHopeProps<C, GridItemOptions>;

/**
 * Utility function to apply a column or row span to the GridItem.
 */
function spanFn(span?: ResponsiveValue<GridSpanValue>) {
  if (span === null || span === undefined) {
    return;
  }

  return mapKeys(span, value => {
    switch (value) {
      case "auto":
        return "auto";
      case "full":
        return "1 / -1";
      default:
        return `span ${value} / span ${value}`;
    }
  });
}

const hopeGridItemClass = "hope-grid-item";

/**
 * Component used as a child of Grid to control the span, and start positions within the grid
 */
export function GridItem<C extends ElementType = "div">(props: GridItemProps<C>) {
  const [local, others] = splitProps(props, [
    "class",
    "area",
    "colSpan",
    "colStart",
    "colEnd",
    "rowSpan",
    "rowStart",
    "rowEnd",
  ]);

  const classes = () => classNames(local.class, hopeGridItemClass);

  return (
    <Box
      class={classes()}
      gridArea={local.area}
      gridColumn={spanFn(local.colSpan)}
      gridRow={spanFn(local.rowSpan)}
      gridColumnStart={local.colStart}
      gridColumnEnd={local.colEnd}
      gridRowStart={local.rowStart}
      gridRowEnd={local.rowEnd}
      {...others}
    />
  );
}

GridItem.toString = () => createClassSelector(hopeGridItemClass);
