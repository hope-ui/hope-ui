import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { gridItemStyles, GridItemVariants } from "./Grid.styles";

export interface GridItemOptions extends GridItemVariants {
  colSpan?: GridItemVariants["gridColumnSpan"];
  colStart?: GridItemVariants["gridColumnStart"];
  colEnd?: GridItemVariants["gridColumnEnd"];
  rowSpan?: GridItemVariants["gridRowSpan"];
  rowStart?: GridItemVariants["gridRowStart"];
  rowEnd?: GridItemVariants["gridRowEnd"];
}

export type GridItemProps<C extends ElementType> = PolymorphicComponentProps<C, GridItemOptions>;

const hopeGridItemClass = "hope-grid-item";

/**
 * Component used as a child of Grid to control the span, and start positions within the grid
 */
export function GridItem<C extends ElementType = "div">(props: GridItemProps<C>) {
  const defaultProps: GridItemProps<"div"> = {
    as: "div",
  };

  props = mergeProps(defaultProps, props);
  const [local, styleProps, shorthandStyleProps, others] = splitProps(
    props,
    commonProps,
    [...boxPropNames, "css"],
    ["colSpan", "colStart", "colEnd", "rowSpan", "rowStart", "rowEnd"]
  );

  const classList = () => {
    return generateClassList({
      hopeClass: hopeGridItemClass,
      baseClass: gridItemStyles({
        gridColumnSpan: shorthandStyleProps.colSpan,
        gridColumnStart: shorthandStyleProps.colStart,
        gridColumnEnd: shorthandStyleProps.colEnd,
        gridRowSpan: shorthandStyleProps.rowSpan,
        gridRowStart: shorthandStyleProps.rowStart,
        gridRowEnd: shorthandStyleProps.rowEnd,
        ...styleProps, // longhand props if provided will override the short ones
      }),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Dynamic component={local.as} classList={classList()} {...others} />;
}

GridItem.toString = () => createCssSelector(hopeGridItemClass);
