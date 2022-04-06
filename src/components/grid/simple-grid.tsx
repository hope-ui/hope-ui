import { Property } from "csstype";
import { splitProps } from "solid-js";

import { ResponsiveValue, SizeScaleValue } from "../../styled-system/types";
import { isNull, isNumber } from "../../utils/assertion";
import { classNames, createClassSelector } from "../../utils/css";
import { mapResponsive } from "../../utils/responsive";
import { ElementType, HTMLHopeProps } from "../types";
import { Grid, GridOptions } from "./grid";

export interface SimpleGridOptions extends GridOptions {
  /**
   * The width at which child elements will break into columns.
   * Pass a number for pixel values or a string for any other valid CSS length.
   */
  minChildWidth?: ResponsiveValue<Property.MinWidth<SizeScaleValue> | number>;

  /**
   * The number of columns
   */
  columns?: ResponsiveValue<number>;
}

export type SimpleGridProps<C extends ElementType = "div"> = HTMLHopeProps<C, SimpleGridOptions>;

const hopeSimpleGridClass = "hope-simple-grid";

function toPx(n: string | number) {
  return isNumber(n) ? `${n}px` : n;
}

function widthToColumns(width: any) {
  return mapResponsive(width, value => (isNull(value) ? null : `repeat(auto-fit, minmax(${toPx(value)}, 1fr))`));
}

function countToColumns(count: any) {
  return mapResponsive(count, value => (isNull(value) ? null : `repeat(${value}, minmax(0, 1fr))`));
}

/**
 * SimpleGrid make its easy to create responsive grid layouts.
 */
export function SimpleGrid<C extends ElementType = "div">(props: SimpleGridProps<C>) {
  const [local, others] = splitProps(props, ["class", "minChildWidth", "columns"]);

  const classes = () => classNames(local.class, hopeSimpleGridClass);

  const templateColumns = () => {
    return local.minChildWidth ? widthToColumns(local.minChildWidth) : countToColumns(local.columns);
  };

  return <Grid class={classes()} templateColumns={templateColumns()} {...others} />;
}

SimpleGrid.toString = () => createClassSelector(hopeSimpleGridClass);
