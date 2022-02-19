import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";

export type TheadProps<C extends ElementType = "thead"> = HopeComponentProps<C>;

const hopeTheadClass = "hope-thead";

export function Thead<C extends ElementType = "thead">(props: TheadProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeTheadClass);

  return <Box as="thead" class={classes()} {...others} />;
}

Thead.toString = () => createClassSelector(hopeTheadClass);
