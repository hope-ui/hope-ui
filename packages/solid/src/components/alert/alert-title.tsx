import { splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { alertTitleStyles } from "./alert.styles";

export type AlertTitleProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeAlertTitleClass = "hope-alert__title";

export function AlertTitle<C extends ElementType = "div">(props: AlertTitleProps<C>) {
  const theme = useStyleConfig().Alert;
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeAlertTitleClass, alertTitleStyles());

  return <Box class={classes()} __baseStyle={theme?.baseStyle?.title} {...others} />;
}

AlertTitle.toString = () => createClassSelector(hopeAlertTitleClass);
