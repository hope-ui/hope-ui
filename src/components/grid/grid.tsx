import { Property } from "csstype";
import { splitProps } from "solid-js";

import { ResponsiveProps } from "@/styled-system/types";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";

export type GridOptions = ResponsiveProps<{
  autoFlow?: Property.GridAutoFlow;
  autoColumns?: Property.GridAutoColumns;
  autoRows?: Property.GridAutoRows;
  templateAreas?: Property.GridTemplateAreas;
  templateColumns?: Property.GridTemplateColumns;
  templateRows?: Property.GridTemplateRows;
}>;

export type GridProps<C extends ElementType = "div"> = HopeComponentProps<C, GridOptions>;

const hopeGridClass = "hope-grid";

/**
 * Hope UI component used to create grid layouts.
 * It renders a `div` with `display: grid` and comes with helpful style shorthand.
 */
export function Grid<C extends ElementType = "div">(props: GridProps<C>) {
  const [local, others] = splitProps(props, [
    "class",
    "autoFlow",
    "autoColumns",
    "autoRows",
    "templateAreas",
    "templateColumns",
    "templateRows",
  ]);

  const classes = () => classNames(local.class, hopeGridClass);

  return (
    <Box
      class={classes()}
      display="grid"
      gridAutoFlow={local.autoFlow}
      gridAutoColumns={local.autoColumns}
      gridAutoRows={local.autoRows}
      gridTemplateAreas={local.templateAreas}
      gridTemplateColumns={local.templateColumns}
      gridTemplateRows={local.templateRows}
      {...others}
    />
  );
}

Grid.toString = () => createClassSelector(hopeGridClass);
