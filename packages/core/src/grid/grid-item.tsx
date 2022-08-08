import {
  createPolymorphicComponent,
  hope,
  mapResponsive,
  ResponsiveValue,
  SystemStyleProps,
} from "@hope-ui/styles";
import { filterUndefined } from "@hope-ui/utils";
import { splitProps } from "solid-js";

export interface GridItemProps {
  /** Shorthand prop for `gridArea`. */
  area?: SystemStyleProps["gridArea"];

  /** The number of columns the grid item should `span`. */
  colSpan?: ResponsiveValue<number | "auto">;

  /** The column number the grid item should start. */
  colStart?: ResponsiveValue<number | "auto">;

  /** The column number the grid item should end. */
  colEnd?: ResponsiveValue<number | "auto">;

  /** The number of rows the grid item should `span`. */
  rowSpan?: ResponsiveValue<number | "auto">;

  /** The row number the grid item should start. */
  rowStart?: ResponsiveValue<number | "auto">;

  /** The row number the grid item should end. */
  rowEnd?: ResponsiveValue<number | "auto">;
}

/** Utility function to apply a column or row span to the `GridItem`. */
function spanFn(span?: ResponsiveValue<number | "auto">) {
  return mapResponsive(span, value => (value === "auto" ? "auto" : `span ${value}/span ${value}`));
}

/**
 * `GridItem` is used as a child of `Grid` to control the span,
 * start and end positions within the grid.
 */
export const GridItem = createPolymorphicComponent<"div", GridItemProps>(props => {
  const [local, others] = splitProps(props, [
    "area",
    "colSpan",
    "colStart",
    "colEnd",
    "rowSpan",
    "rowStart",
    "rowEnd",
  ]);

  return (
    <hope.div
      __css={filterUndefined({
        gridArea: local.area,
        gridColumn: spanFn(local.colSpan),
        gridRow: spanFn(local.rowSpan),
        gridColumnStart: local.colStart,
        gridColumnEnd: local.colEnd,
        gridRowStart: local.rowStart,
        gridRowEnd: local.rowEnd,
      })}
      {...others}
    />
  );
});
