import { mergeProps, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useTableContext } from "./table";
import { tableCaptionStyles, TableCaptionVariants } from "./table.styles";

export type ThemeableTableCaptionOptions = Pick<TableCaptionVariants, "placement">;

export type TableCaptionProps<C extends ElementType = "caption"> = HTMLHopeProps<C, ThemeableTableCaptionOptions>;

const hopeTableCaptionClass = "hope-table-caption";

export function TableCaption<C extends ElementType = "caption">(props: TableCaptionProps<C>) {
  const theme = useComponentStyleConfigs().Table;

  const tableContext = useTableContext();

  const defaultProps: TableCaptionProps<"caption"> = {
    as: "caption",
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

  return <Box class={classes()} __baseStyle={theme?.baseStyle?.caption} {...others} />;
}

TableCaption.toString = () => createClassSelector(hopeTableCaptionClass);
