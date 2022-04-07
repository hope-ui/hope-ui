import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useTableContext } from "./table";
import { tableColumnHeaderStyles, TableColumnHeaderVariants } from "./table.styles";

export type ThProps<C extends ElementType = "th"> = HTMLHopeProps<C, Pick<TableColumnHeaderVariants, "numeric">>;

const hopeThClass = "hope-th";

export function Th<C extends ElementType = "th">(props: ThProps<C>) {
  const theme = useComponentStyleConfigs().Table;

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

  return <Box as="th" role="columnheader" class={classes()} __baseStyle={theme?.baseStyle?.th} {...others} />;
}

Th.toString = () => createClassSelector(hopeThClass);
