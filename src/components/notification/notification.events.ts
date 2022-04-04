import { onCleanup, onMount } from "solid-js";

import type { NotificationConfig, NotificationManagerContextValue } from "./notification-manager";

type ValueOf<T> = T[keyof T];

export const NOTIFICATIONS_EVENTS = {
  show: "hope-ui:show-notification",
  hide: "hope-ui:hide-notification",
  update: "hope-ui:update-notification",
  clear: "hope-ui:clear-notifications",
  clearQueue: "hope-ui:clear-notifications-queue",
} as const;

export function createEvent(type: ValueOf<typeof NOTIFICATIONS_EVENTS>, detail?: any) {
  return new CustomEvent(type, { detail });
}

export function showNotification(config: NotificationConfig) {
  window.dispatchEvent(createEvent(NOTIFICATIONS_EVENTS.show, config));
}

export function updateNotification(config: NotificationConfig & { id: string }) {
  window.dispatchEvent(createEvent(NOTIFICATIONS_EVENTS.update, config));
}

export function hideNotification(id: string) {
  window.dispatchEvent(createEvent(NOTIFICATIONS_EVENTS.hide, id));
}

export function clearNotifications() {
  window.dispatchEvent(createEvent(NOTIFICATIONS_EVENTS.clear));
}

export function clearNotificationsQueue() {
  window.dispatchEvent(createEvent(NOTIFICATIONS_EVENTS.clearQueue));
}

export function useNotificationsEvents(ctx: NotificationManagerContextValue) {
  const events = {
    show: (event: any) => ctx.showNotification(event.detail),
    hide: (event: any) => ctx.hideNotification(event.detail),
    update: (event: any) => ctx.updateNotification(event.detail.id, event.detail),
    clear: ctx.clear,
    clearQueue: ctx.clearQueue,
  };

  onMount(() => {
    Object.keys(events).forEach(event => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.addEventListener(NOTIFICATIONS_EVENTS[event], events[event]);
    });
  });

  onCleanup(() => {
    Object.keys(events).forEach(event => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.removeEventListener(NOTIFICATIONS_EVENTS[event], events[event]);
    });
  });
}
