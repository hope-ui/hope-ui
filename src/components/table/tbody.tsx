import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useTableContext } from "./table";
import { tableBodyStyles } from "./table.styles";

const hopeTbodyClass = "hope-tbody";

export function Tbody<C extends ElementType = "tbody">(props: HopeComponentProps<C>) {
  const tableContext = useTableContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () =>
    classNames(
      local.class,
      hopeTbodyClass,
      tableBodyStyles({
        striped: tableContext.striped,
        highlightOnHover: tableContext.highlightOnHover,
      })
    );

  return <Box as="tbody" class={classes()} {...others} />;
}

Tbody.toString = () => createClassSelector(hopeTbodyClass);
