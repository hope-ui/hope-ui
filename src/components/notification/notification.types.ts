import { JSX } from "solid-js";

import { NotificationVariants } from "./notification.styles";

export interface NotificationConfigRenderProps {
  /**
   * The `id` of the notification.
   */
  id: string;

  /**
   * The function to close the notification.
   */
  close: () => void;
}

export interface NotificationConfig {
  /**
   * The id of the notification, used to update and remove notification.
   * By default, a unique id is generated for each notification.
   */
  id: string;

  /**
   * The status of the notification.
   */
  status?: NotificationVariants["status"];

  /**
   * The title of the notification.
   */
  title?: string;

  /**
   * The description of the notification.
   */
  description?: string;

  /**
   * The delay (in ms) before the notification hides.
   */
  duration?: number;

  /**
   * If `true`, duration will be ignored and the notification will never dismiss.
   */
  persistent?: boolean;

  /**
   * If `true`, the notification will show a close button.
   */
  closable?: boolean;

  /**
   * Callback function to run side effects after the notification has closed.
   */
  onClose?: (id: string) => void;

  /**
   * Render a custom component.
   * It will receive `id` and `onClose` as render props.
   */
  render?: (props: NotificationConfigRenderProps) => JSX.Element;
}

export type ShowNotificationProps = Partial<NotificationConfig>;
