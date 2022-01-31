import { mergeProps, splitProps } from "solid-js";

import { StyledSystemVariants } from "@/styled-system/system.styles";
import { createCssSelector, generateClassList } from "@/utils/function";
import { classPropsKeys } from "@/utils/object";

import { Box } from "../Box/Box";
import { ElementType, HopeComponentProps } from "../types";

export interface GridOptions {
  autoFlow?: StyledSystemVariants["gridAutoFlow"];
  autoColumns?: StyledSystemVariants["gridAutoColumns"];
  autoRows?: StyledSystemVariants["gridAutoRows"];
  columns?: StyledSystemVariants["gridTemplateColumns"];
  rows?: StyledSystemVariants["gridTemplateRows"];
}

export type GridProps<C extends ElementType> = HopeComponentProps<C, GridOptions>;

const hopeGridClass = "hope-grid";

/**
 * Hope UI component used to create grid layouts.
 * It renders a `div` with `display: grid` and comes with helpful style shorthand.
 */
export function Grid<C extends ElementType = "div">(props: GridProps<C>) {
  const defaultProps: GridProps<"div"> = {
    display: "grid",
  };

  const propsWithDefault: GridProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    ...classPropsKeys,
    "autoFlow",
    "autoColumns",
    "autoRows",
    "columns",
    "rows",
  ]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeGridClass,
      baseClass: "",
      classProps: local,
    });
  };

  return (
    <Box
      classList={classList()}
      gridAutoFlow={local.autoFlow}
      gridAutoColumns={local.autoColumns}
      gridAutoRows={local.autoRows}
      gridTemplateColumns={local.columns}
      gridTemplateRows={local.rows}
      {...others}
    />
  );
}

Grid.toString = () => createCssSelector(hopeGridClass);
