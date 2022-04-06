import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useTableContext } from "./table";
import { tableCellStyles, TableCellVariants } from "./table.styles";

export type TdProps<C extends ElementType = "td"> = HTMLHopeProps<C, Pick<TableCellVariants, "numeric">>;

const hopeTdClass = "hope-td";

export function Td<C extends ElementType = "td">(props: TdProps<C>) {
  const theme = useComponentStyleConfigs().Table;

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

  return <Box as="td" role="cell" class={classes()} __baseStyle={theme?.baseStyle?.td} {...others} />;
}

Td.toString = () => createClassSelector(hopeTdClass);
