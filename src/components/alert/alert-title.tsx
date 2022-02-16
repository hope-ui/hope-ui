import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { alertTitleStyles } from "./alert.styles";

export type AlertTitleProps<C extends ElementType> = HopeComponentProps<C>;

const hopeAlertTitleClass = "hope-alert-title";

export function AlertTitle<C extends ElementType = "div">(props: AlertTitleProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeAlertTitleClass, alertTitleStyles());

  return <Box class={classes()} {...others} />;
}

AlertTitle.toString = () => createClassSelector(hopeAlertTitleClass);
