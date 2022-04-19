import { Accessor, createContext, mergeProps, splitProps, useContext } from "solid-js";

import { SystemStyleObject } from "../../styled-system/types";
import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { notificationStyles, NotificationVariants } from "./notification.styles";

type ThemeableNotificationOptions = NotificationVariants;

export type NotificationProps<C extends ElementType = "div"> = HTMLHopeProps<
  C,
  NotificationVariants
>;

const hopeNotificationClass = "hope-notification";

export function Notification<C extends ElementType = "div">(props: NotificationProps<C>) {
  const theme = useStyleConfig().Notification;

  const defaultProps: NotificationProps<"div"> = {};

  const propsWithDefault: NotificationProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "status"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeNotificationClass,
      notificationStyles({
        status: local.status,
      })
    );
  };

  const statusAccessor = () => local.status;

  const context: NotificationContextValue = {
    status: statusAccessor,
  };

  return (
    <NotificationContext.Provider value={context}>
      <Box role="alert" class={classes()} __baseStyle={theme?.baseStyle?.root} {...others} />
    </NotificationContext.Provider>
  );
}

Notification.toString = () => createClassSelector(hopeNotificationClass);

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

type NotificationContextValue = {
  status: Accessor<NotificationVariants["status"]>;
};

const NotificationContext = createContext<NotificationContextValue>();

export function useNotificationContext() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "[Hope UI]: useNotificationContext must be used within an `<Notification />` component"
    );
  }

  return context;
}

/* -------------------------------------------------------------------------------------------------
 * StyleConfig
 * -----------------------------------------------------------------------------------------------*/

export interface NotificationStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    icon?: SystemStyleObject;
    title?: SystemStyleObject;
    description?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableNotificationOptions;
  };
}
