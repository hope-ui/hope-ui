import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { gridItemStyles, GridItemVariants } from "./Grid.styles";

export type GridItemOptions = GridItemVariants & {
  colSpan?: GridItemVariants["gridColumnSpan"];
  colStart?: GridItemVariants["gridColumnStart"];
  colEnd?: GridItemVariants["gridColumnEnd"];
  rowSpan?: GridItemVariants["gridRowSpan"];
  rowStart?: GridItemVariants["gridRowStart"];
  rowEnd?: GridItemVariants["gridRowEnd"];
};

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
  const [local, styleProps, others] = splitProps(props, commonProps, [
    ...boxPropNames,
    "css",
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
      baseClass: gridItemStyles({
        ...styleProps,
        gridColumnSpan: styleProps.colSpan,
        gridColumnStart: styleProps.colStart,
        gridColumnEnd: styleProps.colEnd,
        gridRowSpan: styleProps.rowSpan,
        gridRowStart: styleProps.rowStart,
        gridRowEnd: styleProps.rowEnd,
      }),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Dynamic component={local.as} classList={classList()} {...others} />;
}

GridItem.toString = () => createCssSelector(hopeGridItemClass);
