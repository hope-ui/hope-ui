import { Match, onCleanup, onMount, Show, splitProps, Switch } from "solid-js";

import { CloseButton } from "../close-button/close-button";
import { VStack } from "../stack/stack";
import { HTMLHopeProps } from "../types";
import { Notification } from "./notification";
import { NotificationConfig } from "./notification.types";
import { NotificationDescription } from "./notification-description";
import { NotificationIcon } from "./notification-icon";
import { NotificationTitle } from "./notification-title";
import { useNotificationsProviderContext } from "./notifications-provider";

type NotificationContainerOptions = Omit<NotificationConfig, "onClose">;

export type NotificationContainerProps = HTMLHopeProps<"div", NotificationContainerOptions>;

/**
 * The container for a notification.
 * It renders the default Hope UI designed notification or a custom one if the `render` prop is passed.
 */
export function NotificationContainer(props: NotificationContainerProps) {
  const notificationsProviderContext = useNotificationsProviderContext();

  const [local, others] = splitProps(props, [
    "render",
    "id",
    "status",
    "title",
    "description",
    "closable",
    "duration",
    "onMouseEnter",
    "onMouseLeave",
  ]);

  let closeDelayId: number | undefined;

  const clearCloseDelay = () => {
    if (closeDelayId) {
      window.clearTimeout(closeDelayId);
    }
  };

  const closeNotification = () => {
    clearCloseDelay();

    notificationsProviderContext.hideNotification(local.id);
  };

  const closeWithDelay = () => {
    if (local.duration !== null) {
      closeDelayId = window.setTimeout(closeNotification, local.duration);
    }
  };

  onMount(() => {
    closeWithDelay();
  });

  onCleanup(() => {
    clearCloseDelay();
  });

  return (
    <Show
      when={local.render}
      fallback={
        <Notification status={local.status} onMouseEnter={clearCloseDelay} onMouseLeave={closeWithDelay} {...others}>
          <Show when={local.status}>
            <NotificationIcon mr="$2_5" />
          </Show>
          <Switch>
            <Match when={local.title && local.description}>
              <VStack alignItems="flex-start">
                <NotificationTitle>{local.title}</NotificationTitle>
                <NotificationDescription>{local.description}</NotificationDescription>
              </VStack>
            </Match>
            <Match when={local.title}>
              <NotificationTitle>{local.title}</NotificationTitle>
            </Match>
            <Match when={local.description}>
              <NotificationDescription>{local.description}</NotificationDescription>
            </Match>
          </Switch>
          <Show when={local.closable}>
            <CloseButton size="sm" position="absolute" top="$1_5" right="$1_5" onClick={closeNotification} />
          </Show>
        </Notification>
      }
    >
      {local.render?.({
        id: local.id,
        close: closeNotification,
      })}
    </Show>
  );
}
