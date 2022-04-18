import { mergeProps, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useTableContext } from "./table";
import { tableCaptionStyles, TableCaptionVariants } from "./table.styles";

export type ThemeableTableCaptionOptions = Pick<TableCaptionVariants, "placement">;

export type TableCaptionProps<C extends ElementType = "caption"> = HTMLHopeProps<
  C,
  ThemeableTableCaptionOptions
>;

const hopeTableCaptionClass = "hope-table-caption";

export function TableCaption<C extends ElementType = "caption">(props: TableCaptionProps<C>) {
  const theme = useStyleConfig().Table;

  const tableContext = useTableContext();

  const defaultProps: TableCaptionProps<"caption"> = {
    placement: theme?.defaultProps?.caption?.placement ?? "bottom",
  };

  const propsWithDefault: TableCaptionProps<"caption"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "placement"]);

  const classes = () =>
    classNames(
      local.class,
      hopeTableCaptionClass,
      tableCaptionStyles({
        dense: tableContext.dense,
        placement: local.placement,
      })
    );

  return <hope.caption class={classes()} __baseStyle={theme?.baseStyle?.caption} {...others} />;
}

TableCaption.toString = () => createClassSelector(hopeTableCaptionClass);
