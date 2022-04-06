import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { notificationTitleStyles } from "./notification.styles";

export type NotificationTitleProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeNotificationTitleClass = "hope-notification__title";

export function NotificationTitle<C extends ElementType = "div">(props: NotificationTitleProps<C>) {
  const theme = useComponentStyleConfigs().Notification;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeNotificationTitleClass, notificationTitleStyles());

  return <Box class={classes()} __baseStyle={theme?.baseStyle?.title} {...others} />;
}

NotificationTitle.toString = () => createClassSelector(hopeNotificationTitleClass);
