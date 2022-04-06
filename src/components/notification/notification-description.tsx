import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { notificationDescriptionStyles } from "./notification.styles";

export type NotificationDescriptionProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeNotificationDescriptionClass = "hope-notification__description";

export function NotificationDescription<C extends ElementType = "div">(props: NotificationDescriptionProps<C>) {
  const theme = useComponentStyleConfigs().Notification;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeNotificationDescriptionClass, notificationDescriptionStyles());

  return <Box class={classes()} __baseStyle={theme?.baseStyle?.description} {...others} />;
}

NotificationDescription.toString = () => createClassSelector(hopeNotificationDescriptionClass);
