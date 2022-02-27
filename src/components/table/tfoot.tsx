import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { tableFootStyles } from "./table.styles";

export type TfootProps<C extends ElementType = "tfoot"> = HTMLHopeProps<C>;

const hopeTfootClass = "hope-tfoot";

export function Tfoot<C extends ElementType = "tfoot">(props: TfootProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeTfootClass, tableFootStyles());

  return <Box as="tfoot" role="rowgroup" class={classes()} {...others} />;
}

Tfoot.toString = () => createClassSelector(hopeTfootClass);
