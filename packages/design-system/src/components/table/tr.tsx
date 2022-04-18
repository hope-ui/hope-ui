import { splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";

export type TrProps<C extends ElementType = "tr"> = HTMLHopeProps<C>;

const hopeTrClass = "hope-tr";

export function Tr<C extends ElementType = "tr">(props: TrProps<C>) {
  const theme = useStyleConfig().Table;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeTrClass);

  return (
    <Box as="tr" role="row" class={classes()} __baseStyle={theme?.baseStyle?.tr} {...others} />
  );
}

Tr.toString = () => createClassSelector(hopeTrClass);
