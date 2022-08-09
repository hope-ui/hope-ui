import { createPolymorphicComponent, hope, HopeProps, SystemStyleProps } from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

export interface GridProps extends HopeProps {
  /** Shorthand prop for `gridAutoFlow`. */
  autoFlow?: SystemStyleProps["gridAutoFlow"];

  /** Shorthand prop for `gridAutoColumns`. */
  autoColumns?: SystemStyleProps["gridAutoColumns"];

  /** Shorthand prop for `gridAutoRows`. */
  autoRows?: SystemStyleProps["gridAutoRows"];

  /** Shorthand prop for `gridTemplateAreas`. */
  templateAreas?: SystemStyleProps["gridTemplateAreas"];

  /** Shorthand prop for `gridTemplateColumns`. */
  templateColumns?: SystemStyleProps["gridTemplateColumns"];

  /** Shorthand prop for `gridTemplateRows`. */
  templateRows?: SystemStyleProps["gridTemplateRows"];

  /** Shorthand prop for `gridColumn`. */
  column?: SystemStyleProps["gridColumn"];

  /** Shorthand prop for `gridRow`. */
  row?: SystemStyleProps["gridRow"];
}

/**
 * `Grid` is used to create grid layouts.
 * It renders a `div` with `display: grid` and comes with helpful style shorthand.
 */
export const Grid = createPolymorphicComponent<"div", GridProps>(props => {
  const [local, others] = splitProps(props, [
    "class",
    "autoFlow",
    "autoColumns",
    "autoRows",
    "templateAreas",
    "templateColumns",
    "templateRows",
    "column",
    "row",
  ]);

  return (
    <hope.div
      class={clsx("hope-grid", local.class)}
      __css={{
        display: "grid",
        gridAutoFlow: local.autoFlow,
        gridAutoColumns: local.autoColumns,
        gridAutoRows: local.autoRows,
        gridTemplateAreas: local.templateAreas,
        gridTemplateColumns: local.templateColumns,
        gridTemplateRows: local.templateRows,
      }}
      {...others}
    />
  );
});
