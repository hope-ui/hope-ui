import {
  Accessor,
  createContext,
  createMemo,
  createUniqueId,
  For,
  JSX,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from "solid-js";
import { Portal } from "solid-js/web";
import { TransitionGroup } from "solid-transition-group";

import { createQueue } from "@/hooks/create-queue";
import { PositionProps } from "@/styled-system/props/position";
import { classNames } from "@/utils/css";

import { Box } from "../box/box";
import { NOTIFICATIONS_EVENTS } from "./notification.events";
import {
  NotificationListVariants,
  notificationsProviderStyles,
  notificationTransitionName,
} from "./notification.styles";
import { NotificationConfig, ShowNotificationProps } from "./notification.types";
import { NotificationContainer } from "./notification-container";

interface NotificationsProviderProps extends NotificationListVariants {
  /**
   * Maximum amount of notifications displayed at a time,
   * other new notifications will be added to queue.
   */
  limit?: number;

  /**
   * The delay (in ms) before the notification hides.
   */
  duration?: number;

  /**
   * If `true`, duration will be ignored and notifications will never dismiss.
   */
  persistent?: boolean;

  /**
   * If `true`, notifications will show a close button.
   */
  closable?: boolean;

  /**
   * The `z-index` css property of all notifications.
   */
  zIndex?: PositionProps["zIndex"];

  /**
   * The children of the notifications provider.
   */
  children: JSX.Element;
}

const hopeNotificationsProviderClass = "hope-notification__provider";

const DEFAULT_NOTIFICATION_DURATION = 4_000;

/**
 * Context provider for the notification system.
 */
export function NotificationsProvider(props: NotificationsProviderProps) {
  const [local] = splitProps(props, ["children", "placement", "duration", "persistent", "closable", "limit", "zIndex"]);

  const notificationQueue = createMemo(() => {
    return createQueue<NotificationConfig>({
      initialValues: [],
      limit: local.limit ?? 10,
    });
  });

  const finalPlacement: Accessor<NotificationsProviderProps["placement"]> = () => local.placement ?? "top-end";

  const notificationsAccessor = () => notificationQueue().state.current;

  const queueAccessor = () => notificationQueue().state.queue;

  const showNotification = (notification: ShowNotificationProps) => {
    const id = notification.id ?? `hope-notification-${createUniqueId()}`;
    const persistent = notification.persistent ?? local.persistent ?? false;
    const duration = notification.duration ?? local.duration ?? DEFAULT_NOTIFICATION_DURATION;
    const closable = notification.closable ?? local.closable ?? true;

    notificationQueue().update(notifications => {
      if (notification.id && notifications.some(n => n.id === notification.id)) {
        return notifications;
      }

      const newNotification: NotificationConfig = { ...notification, id, persistent, duration, closable };

      return [...notifications, newNotification];
    });

    return id;
  };

  const updateNotification = (id: string, notification: NotificationConfig) => {
    notificationQueue().update(notifications => {
      const index = notifications.findIndex(n => n.id === id);

      if (index === -1) {
        return notifications;
      }

      const newNotifications = [...notifications];
      newNotifications[index] = notification;

      return newNotifications;
    });
  };

  const hideNotification = (id: string) => {
    notificationQueue().update(notifications => {
      return notifications.filter(notification => {
        if (notification.id === id) {
          notification.onClose?.(notification.id);
          return false;
        }

        return true;
      });
    });
  };

  const clear = () => notificationQueue().update(() => []);

  const clearQueue = () => notificationQueue().clearQueue();

  const classes = () => {
    return classNames(
      hopeNotificationsProviderClass,
      notificationsProviderStyles({
        placement: finalPlacement(),
      })
    );
  };

  const transitionName = () => {
    switch (finalPlacement()) {
      case "top-start":
        return notificationTransitionName.slideInLeft;
      case "top":
        return notificationTransitionName.slideInTop;
      case "top-end":
        return notificationTransitionName.slideInRight;
      case "bottom-start":
        return notificationTransitionName.slideInLeft;
      case "bottom":
        return notificationTransitionName.slideInBottom;
      case "bottom-end":
        return notificationTransitionName.slideInRight;
      default:
        return notificationTransitionName.slideInRight;
    }
  };

  const context: NotificationsProviderContextValue = {
    notifications: notificationsAccessor,
    queue: queueAccessor,
    showNotification,
    updateNotification,
    hideNotification,
    clear,
    clearQueue,
  };

  const showHandler = (event: any) => showNotification(event.detail);
  const updateHandler = (event: any) => updateNotification(event.detail.id, event.detail);
  const hideHandler = (event: any) => hideNotification(event.detail);

  onMount(() => {
    window.addEventListener(NOTIFICATIONS_EVENTS.show, showHandler);
    window.addEventListener(NOTIFICATIONS_EVENTS.update, updateHandler);
    window.addEventListener(NOTIFICATIONS_EVENTS.hide, hideHandler);
    window.addEventListener(NOTIFICATIONS_EVENTS.clear, clear);
    window.addEventListener(NOTIFICATIONS_EVENTS.clearQueue, clearQueue);
  });

  onCleanup(() => {
    window.removeEventListener(NOTIFICATIONS_EVENTS.show, showHandler);
    window.removeEventListener(NOTIFICATIONS_EVENTS.update, updateHandler);
    window.removeEventListener(NOTIFICATIONS_EVENTS.hide, hideHandler);
    window.removeEventListener(NOTIFICATIONS_EVENTS.clear, clear);
    window.removeEventListener(NOTIFICATIONS_EVENTS.clearQueue, clearQueue);
  });

  return (
    <NotificationsProviderContext.Provider value={context}>
      <Portal>
        <Box class={classes()} zIndex={local.zIndex}>
          <TransitionGroup name={transitionName()}>
            <For each={context.notifications()}>{notification => <NotificationContainer {...notification} />}</For>
          </TransitionGroup>
        </Box>
      </Portal>
      {local.children}
    </NotificationsProviderContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

export interface NotificationsProviderContextValue {
  /**
   * All currently displayed notifications.
   */
  notifications: Accessor<NotificationConfig[]>;

  /**
   * All pending notifications.
   */
  queue: Accessor<NotificationConfig[]>;

  /**
   * Show a notification.
   */
  showNotification(config: NotificationConfig): string;

  /**
   * Update a notification for a given `id`.
   */
  updateNotification(id: string, config: NotificationConfig): void;

  /**
   * Hide a notification.
   */
  hideNotification(id: string): void;

  /**
   * Remove all notifications.
   * (displayed and from the queue)
   */
  clear(): void;

  /**
   * Remove all pending notifications for the queue only.
   */
  clearQueue(): void;
}

const NotificationsProviderContext = createContext<NotificationsProviderContextValue>();

export function useNotificationsProviderContext() {
  const context = useContext(NotificationsProviderContext);

  if (!context) {
    throw new Error(
      "[Hope UI]: useNotificationManagerContext must be used within a `<NotificationsProvider />` component"
    );
  }

  return context;
}
