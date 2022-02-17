import { mergeProps, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Icon, IconProps } from "../icon/icon";
import {
  IconCheckCircleSolid,
  IconExclamationCircleSolid,
  IconExclamationTriangleSolid,
  IconInfoCircleSolid,
} from "../icons";
import { ElementType } from "../types";
import { alertIconStyles } from "./alert.styles";
import { useAlertContext } from "./alert-provider";

const hopeAlertIconClass = "hope-alert-icon";

export function AlertIcon<C extends ElementType = "svg">(props: IconProps<C>) {
  const { status } = useAlertContext();

  const defaultProps: IconProps<"svg"> = {
    boxSize: "$6",
  };

  const propsWithDefault: IconProps<"svg"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["as", "class"]);

  const classes = () => classNames(local.class, hopeAlertIconClass, alertIconStyles());

  const icon = () => {
    if (local.as) {
      return local.as as ElementType;
    }

    switch (status()) {
      case "success":
        return IconCheckCircleSolid;
        break;
      case "info":
        return IconInfoCircleSolid;
        break;
      case "warning":
        return IconExclamationTriangleSolid;
        break;
      case "danger":
        return IconExclamationCircleSolid;
        break;
    }
  };

  return <Icon as={icon()} class={classes()} {...others} />;
}

AlertIcon.toString = () => createClassSelector(hopeAlertIconClass);
