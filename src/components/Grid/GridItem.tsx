import { splitProps } from "solid-js";

import { StyledSystemVariants } from "@/styled-system/system.styles";
import { createCssSelector, generateClassList } from "@/utils/function";
import { classPropsKeys } from "@/utils/object";

import { Box } from "../Box/Box";
import { ElementType, HopeComponentProps } from "../types";

export interface GridItemOptions {
  colSpan?: StyledSystemVariants["gridColumnSpan"];
  colStart?: StyledSystemVariants["gridColumnStart"];
  colEnd?: StyledSystemVariants["gridColumnEnd"];
  rowSpan?: StyledSystemVariants["gridRowSpan"];
  rowStart?: StyledSystemVariants["gridRowStart"];
  rowEnd?: StyledSystemVariants["gridRowEnd"];
}

export type GridItemProps<C extends ElementType> = HopeComponentProps<C, GridItemOptions>;

const hopeGridItemClass = "hope-grid-item";

/**
 * Component used as a child of Grid to control the span, and start positions within the grid
 */
export function GridItem<C extends ElementType = "div">(props: GridItemProps<C>) {
  const [local, others] = splitProps(props, [
    ...classPropsKeys,
    "colSpan",
    "colStart",
    "colEnd",
    "rowSpan",
    "rowStart",
    "rowEnd",
  ]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeGridItemClass,
      baseClass: "",
      classProps: local,
    });
  };

  return (
    <Box
      classList={classList()}
      gridColumnSpan={local.colSpan}
      gridColumnStart={local.colStart}
      gridColumnEnd={local.colEnd}
      gridRowSpan={local.rowSpan}
      gridRowStart={local.rowStart}
      gridRowEnd={local.rowEnd}
      {...others}
    />
  );
}

GridItem.toString = () => createCssSelector(hopeGridItemClass);
