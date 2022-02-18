import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";

const hopeTrClass = "hope-tr";

export function Tr<C extends ElementType = "tr">(props: HopeComponentProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeTrClass);

  return <Box as="tr" role="row" class={classes()} {...others} />;
}

Tr.toString = () => createClassSelector(hopeTrClass);
