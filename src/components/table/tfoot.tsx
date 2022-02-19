import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { tableFootStyles } from "./table.styles";

export type TfootProps<C extends ElementType = "tfoot"> = HopeComponentProps<C>;

const hopeTfootClass = "hope-tfoot";

export function Tfoot<C extends ElementType = "tfoot">(props: TfootProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeTfootClass, tableFootStyles());

  return <Box as="tfoot" class={classes()} {...others} />;
}

Tfoot.toString = () => createClassSelector(hopeTfootClass);
