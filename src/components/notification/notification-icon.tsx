import { mergeProps, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Icon, IconProps } from "../icon/icon";
import { IconCheckCircleSolid } from "../icons/IconCheckCircleSolid";
import { IconExclamationCircleSolid } from "../icons/IconExclamationCircleSolid";
import { IconExclamationTriangleSolid } from "../icons/IconExclamationTriangleSolid";
import { IconInfoCircleSolid } from "../icons/IconInfoCircleSolid";
import { ElementType } from "../types";
import { useNotificationContext } from "./notification";
import { notificationIconStyles } from "./notification.styles";

export type NotificationIconProps<C extends ElementType = "svg"> = IconProps<C>;

const hopeNotificationIconClass = "hope-notification__icon";

export function NotificationIcon<C extends ElementType = "svg">(props: NotificationIconProps<C>) {
  const theme = useComponentStyleConfigs().Notification;
  const { status } = useNotificationContext();

  const defaultProps: NotificationIconProps<"svg"> = {
    boxSize: "$7",
  };

  const propsWithDefault: NotificationIconProps<"svg"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["as", "class"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeNotificationIconClass,
      notificationIconStyles({
        status: status(),
      })
    );
  };

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

NotificationIcon.toString = () => createClassSelector(hopeNotificationIconClass);
