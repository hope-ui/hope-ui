import { createEvent, NOTIFICATIONS_EVENTS } from "./notification.events";
import { NotificationConfig, ShowNotificationProps } from "./notification.types";

function show(config: ShowNotificationProps) {
  window.dispatchEvent(createEvent(NOTIFICATIONS_EVENTS.show, config));
}

function update(config: NotificationConfig & { id: string }) {
  window.dispatchEvent(createEvent(NOTIFICATIONS_EVENTS.update, config));
}

function hide(id: string) {
  window.dispatchEvent(createEvent(NOTIFICATIONS_EVENTS.hide, id));
}

function clear() {
  window.dispatchEvent(createEvent(NOTIFICATIONS_EVENTS.clear));
}

function clearQueue() {
  window.dispatchEvent(createEvent(NOTIFICATIONS_EVENTS.clearQueue));
}

export const notificationService = {
  show,
  update,
  hide,
  clear,
  clearQueue,
};
