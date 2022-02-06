import { splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { alertTitleStyles, AlertTitleVariants } from "./alert.styles";

export type AlertTitleProps<C extends ElementType> = HopeComponentProps<C, AlertTitleVariants>;

const hopeAlertTitleClass = "hope-alert-title";

export function AlertTitle<C extends ElementType = "div">(props: AlertTitleProps<C>) {
  const [local, others] = splitProps(props, ["class", "size"]);

  const classes = () =>
    classNames(local.class, hopeAlertTitleClass, alertTitleStyles({ size: local.size }));

  return <Box class={classes()} {...others} />;
}

AlertTitle.toString = () => createCssSelector(hopeAlertTitleClass);
