import { createContext, JSX, useContext } from "solid-js";

type NotificationStatus = "success" | "info" | "warning" | "danger";

type NotificationPlacement = "top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end";

interface NotificationConfigRenderProps {
  id: string;
  onClose: () => void;
}

export interface NotificationConfig {
  /**
   * The id of the notification, used to update and remove notification.
   * By default, a unique id is generated for each notification.
   */
  id?: string;

  /**
   * The status of the notification.
   */
  status?: NotificationStatus;

  /**
   * The title of the notification.
   */
  title?: string;

  /**
   * The description of the notification.
   */
  description?: string;

  /**
   * If `true`, the notification will show a close button.
   */
  closable?: boolean;

  /**
   * The delay (in ms) before the notification hides.
   * If set to `null`, the notification will never dismiss.
   */
  duration?: number | null;

  /**
   * The placement of the notification.
   */
  placement?: NotificationPlacement;

  /**
   * Callback function to run side effects after the notification has closed.
   */
  onClose?: () => void;

  /**
   * Render a custom component.
   * It will receive `id` and `onClose` as render props.
   */
  render?: (props: NotificationConfigRenderProps) => JSX.Element;
}

interface NotificationManagerState {
  /**
   * All currently displayed notifications.
   */
  notifications: NotificationConfig[];

  /**
   * All pending notifications.
   */
  queue: NotificationConfig[];
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

export interface NotificationManagerContextValue {
  state: NotificationManagerState;

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

const NotificationManagerContext = createContext<NotificationManagerContextValue>();

export function useNotificationManagerContext() {
  const context = useContext(NotificationManagerContext);

  if (!context) {
    throw new Error(
      "[Hope UI]: useNotificationManagerContext must be used within a `<NotificationManager />` component"
    );
  }

  return context;
}
