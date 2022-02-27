import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useComponentStyleConfigs } from "@/theme/provider";

export type TheadProps<C extends ElementType = "thead"> = HTMLHopeProps<C>;

const hopeTheadClass = "hope-thead";

export function Thead<C extends ElementType = "thead">(props: TheadProps<C>) {
  const theme = useComponentStyleConfigs().Table;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeTheadClass);

  return <Box as="thead" role="rowgroup" class={classes()} __baseStyle={theme?.baseStyle?.thead} {...others} />;
}

Thead.toString = () => createClassSelector(hopeTheadClass);
