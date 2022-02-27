import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { alertDescriptionStyles } from "./alert.styles";

export type AlertDescriptionProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeAlertDescriptionClass = "hope-alert-description";

export function AlertDescription<C extends ElementType = "div">(props: AlertDescriptionProps<C>) {
  const theme = useComponentStyleConfigs().Alert;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeAlertDescriptionClass, alertDescriptionStyles());

  return <Box class={classes()} __baseStyle={theme?.baseStyle?.description} {...others} />;
}

AlertDescription.toString = () => createClassSelector(hopeAlertDescriptionClass);
