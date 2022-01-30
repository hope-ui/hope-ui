import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createCssSelector, generateClassList } from "@/utils/function";
import { commonProps } from "@/utils/object";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { gridStyles, GridVariants } from "./Grid.styles";

export interface GridOptions extends GridVariants {
  autoFlow?: GridVariants["gridAutoFlow"];
  autoColumns?: GridVariants["gridAutoColumns"];
  autoRows?: GridVariants["gridAutoRows"];
  columns?: GridVariants["gridTemplateColumns"];
  rows?: GridVariants["gridTemplateRows"];
}

export type GridProps<C extends ElementType> = PolymorphicComponentProps<C, GridOptions>;

const hopeGridClass = "hope-grid";

/**
 * Hope UI component used to create grid layouts.
 * It renders a `div` with `display: grid` and comes with helpful style shorthand.
 */
export function Grid<C extends ElementType = "div">(props: GridProps<C>) {
  const defaultProps: GridProps<"div"> = {
    as: "div",
  };

  const propsWithDefault: GridProps<C> = mergeProps(defaultProps, props);
  const [local, styleProps, shorthandStyleProps, others] = splitProps(
    propsWithDefault,
    commonProps,
    [...boxPropNames, "css"],
    ["autoFlow", "autoColumns", "autoRows", "columns", "rows"]
  );

  const classList = () => {
    return generateClassList({
      hopeClass: hopeGridClass,
      baseClass: gridStyles({
        gridAutoFlow: shorthandStyleProps.autoFlow,
        gridAutoColumns: shorthandStyleProps.autoColumns,
        gridAutoRows: shorthandStyleProps.autoRows,
        gridTemplateColumns: shorthandStyleProps.columns,
        gridTemplateRows: shorthandStyleProps.rows,
        ...styleProps, // longhand props if provided will override the short ones
      }),
      classProps: local,
    });
  };

  return <Dynamic component={local.as} classList={classList()} {...others} />;
}

Grid.toString = () => createCssSelector(hopeGridClass);
