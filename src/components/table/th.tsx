import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useTableContext } from "./table";
import { tableColumnHeaderStyles, TableColumnHeaderVariants } from "./table.styles";

export type ThProps<C extends ElementType> = HopeComponentProps<
  C,
  Pick<TableColumnHeaderVariants, "numeric">
>;

const hopeThClass = "hope-th";

export function Th<C extends ElementType = "th">(props: ThProps<C>) {
  const tableContext = useTableContext();

  const [local, others] = splitProps(props, ["class", "numeric"]);

  const classes = () =>
    classNames(
      local.class,
      hopeThClass,
      tableColumnHeaderStyles({
        dense: tableContext.dense,
        numeric: local.numeric,
      })
    );

  return <Box as="th" role="row" class={classes()} {...others} />;
}

Th.toString = () => createClassSelector(hopeThClass);
