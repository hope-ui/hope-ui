import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useTableContext } from "./table";
import { tableCellStyles, TableCellVariants } from "./table.styles";

export type TdProps<C extends ElementType = "td"> = HopeComponentProps<C, Pick<TableCellVariants, "numeric">>;

const hopeTdClass = "hope-td";

export function Td<C extends ElementType = "td">(props: TdProps<C>) {
  const tableContext = useTableContext();

  const [local, others] = splitProps(props, ["class", "numeric"]);

  const classes = () =>
    classNames(
      local.class,
      hopeTdClass,
      tableCellStyles({
        dense: tableContext.dense,
        numeric: local.numeric,
      })
    );

  return <Box as="td" role="gridcell" class={classes()} {...others} />;
}

Td.toString = () => createClassSelector(hopeTdClass);
