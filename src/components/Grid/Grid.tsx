import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { gridStyles, GridVariants } from "./Grid.styles";

export type GridOptions = GridVariants & {
  autoFlow?: GridVariants["gridAutoFlow"];
  autoColumns?: GridVariants["gridAutoColumns"];
  autoRows?: GridVariants["gridAutoRows"];
  columns?: GridVariants["gridTemplateColumns"];
  rows?: GridVariants["gridTemplateRows"];
};

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

  props = mergeProps(defaultProps, props);
  const [local, styleProps, others] = splitProps(props, commonProps, [
    ...boxPropNames,
    "css",
    "autoFlow",
    "autoColumns",
    "autoRows",
    "columns",
    "rows",
  ]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeGridClass,
      baseClass: gridStyles({
        ...styleProps,
        gridAutoFlow: styleProps.autoFlow,
        gridAutoColumns: styleProps.autoColumns,
        gridAutoRows: styleProps.autoRows,
        gridTemplateColumns: styleProps.columns,
        gridTemplateRows: styleProps.rows,
      }),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Dynamic component={local.as} classList={classList()} {...others} />;
}

Grid.toString = () => createCssSelector(hopeGridClass);
