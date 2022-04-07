import { mergeProps, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Icon, IconProps } from "../icon/icon";
import { IconCheckCircleSolid } from "../icons/IconCheckCircleSolid";
import { IconExclamationCircleSolid } from "../icons/IconExclamationCircleSolid";
import { IconExclamationTriangleSolid } from "../icons/IconExclamationTriangleSolid";
import { IconInfoCircleSolid } from "../icons/IconInfoCircleSolid";
import { ElementType } from "../types";
import { useAlertContext } from "./alert";
import { alertIconStyles } from "./alert.styles";

export type AlertIconProps<C extends ElementType = "svg"> = IconProps<C>;

const hopeAlertIconClass = "hope-alert__icon";

export function AlertIcon<C extends ElementType = "svg">(props: AlertIconProps<C>) {
  const theme = useComponentStyleConfigs().Alert;
  const { status } = useAlertContext();

  const defaultProps: AlertIconProps<"svg"> = {
    boxSize: "$6",
  };

  const propsWithDefault: AlertIconProps<"svg"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["as", "class"]);

  const classes = () => classNames(local.class, hopeAlertIconClass, alertIconStyles());

  const icon = () => {
    if (local.as) {
      return local.as as ElementType;
    }

    switch (status()) {
      case "success":
        return IconCheckCircleSolid;
      case "info":
        return IconInfoCircleSolid;
      case "warning":
        return IconExclamationTriangleSolid;
      case "danger":
        return IconExclamationCircleSolid;
    }
  };

  return <Icon as={icon()} class={classes()} __baseStyle={theme?.baseStyle?.icon} {...others} />;
}

AlertIcon.toString = () => createClassSelector(hopeAlertIconClass);
