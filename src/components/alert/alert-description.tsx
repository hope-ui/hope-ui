import { splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { alertDescriptionStyles, AlertDescriptionVariants } from "./alert.styles";

export type AlertDescriptionProps<C extends ElementType> = HopeComponentProps<
  C,
  AlertDescriptionVariants
>;

const hopeAlertDescriptionClass = "hope-alert-description";

export function AlertDescription<C extends ElementType = "div">(props: AlertDescriptionProps<C>) {
  const [local, others] = splitProps(props, ["class", "size"]);

  const classes = () =>
    classNames(
      local.class,
      hopeAlertDescriptionClass,
      alertDescriptionStyles({ size: local.size })
    );

  return <Box class={classes()} {...others} />;
}

AlertDescription.toString = () => createCssSelector(hopeAlertDescriptionClass);
