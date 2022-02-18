import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { tableHeadStyles } from "./table.styles";

const hopeTheadClass = "hope-thead";

export function Thead<C extends ElementType = "thead">(props: HopeComponentProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeTheadClass, tableHeadStyles());

  return <Box as="thead" class={classes()} {...others} />;
}

Thead.toString = () => createClassSelector(hopeTheadClass);
