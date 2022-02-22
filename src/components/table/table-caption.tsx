import { mergeProps, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useTableContext } from "./table";
import { tableCaptionStyles, TableCaptionVariants } from "./table.styles";

export type TableCaptionProps<C extends ElementType = "caption"> = HTMLHopeProps<
  C,
  Omit<TableCaptionVariants, "dense">
>;

const hopeTableCaptionClass = "hope-table-caption";

export function TableCaption<C extends ElementType = "caption">(props: TableCaptionProps<C>) {
  const tableContext = useTableContext();

  const defaultProps: TableCaptionProps<"caption"> = {
    as: "caption",
    placement: "bottom",
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

  return <Box class={classes()} {...others} />;
}

TableCaption.toString = () => createClassSelector(hopeTableCaptionClass);
