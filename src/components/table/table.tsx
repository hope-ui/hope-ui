import { createContext, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { SystemStyleObject } from "../../styled-system/types";
import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { tableStyles } from "./table.styles";
import { ThemeableTableCaptionOptions } from "./table-caption";

export interface TableContextValue {
  /**
   * Set a neutral background color on odd or even row of table.
   */
  striped?: "odd" | "even";

  /**
   * If `true`, row will have less padding.
   */
  dense: boolean;

  /**
   * If `true`, row will have hover color.
   */
  highlightOnHover: boolean;
}

export type TableOptions = Partial<TableContextValue>;

export type TableProps<C extends ElementType = "table"> = HTMLHopeProps<C, TableOptions>;

export interface TableStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    caption?: SystemStyleObject;
    thead?: SystemStyleObject;
    tbody?: SystemStyleObject;
    tfoot?: SystemStyleObject;
    tr?: SystemStyleObject;
    th?: SystemStyleObject;
    td?: SystemStyleObject;
  };
  defaultProps?: {
    root?: TableOptions;
    caption?: ThemeableTableCaptionOptions;
  };
}

const TableContext = createContext<TableContextValue>();

const hopeTableClass = "hope-table";

export function Table<C extends ElementType = "table">(props: TableProps<C>) {
  const theme = useComponentStyleConfigs().Table;

  const [state] = createStore<TableContextValue>({
    get striped() {
      return props.striped ?? theme?.defaultProps?.root?.striped;
    },
    get dense() {
      return props.dense ?? theme?.defaultProps?.root?.dense ?? false;
    },
    get highlightOnHover() {
      return props.highlightOnHover ?? theme?.defaultProps?.root?.highlightOnHover ?? false;
    },
  });

  const [local, others] = splitProps(props, ["class", "striped", "dense", "highlightOnHover"]);

  const classes = () => classNames(local.class, hopeTableClass, tableStyles(state));

  return (
    <TableContext.Provider value={state}>
      <Box as="table" role="table" class={classes()} __baseStyle={theme?.baseStyle?.root} {...others} />
    </TableContext.Provider>
  );
}

Table.toString = () => createClassSelector(hopeTableClass);

export function useTableContext() {
  const context = useContext(TableContext);

  if (!context) {
    throw new Error("[Hope UI]: useTableContext must be used within a `<Table/>` component");
  }

  return context;
}
