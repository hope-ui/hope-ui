// Each part lives in its own `alert-<part>.tsx`; this barrel is the one place the `Alert` namespace
// object is assembled, and the component's single published entry point.
import { Actions } from "./alert-actions";
import { CloseTrigger } from "./alert-close-trigger";
import { Content } from "./alert-content";
import { Description } from "./alert-description";
import { Icon } from "./alert-icon";
import { Root } from "./alert-root";
import { Title } from "./alert-title";

export const Alert = { Root, Icon, Content, Title, Description, Actions, CloseTrigger };

export type { AlertActionsProps } from "./alert-actions";
export type { AlertCloseTriggerProps } from "./alert-close-trigger";
export type { AlertContentProps } from "./alert-content";
export type { AlertDescriptionProps } from "./alert-description";
export type { AlertIconProps } from "./alert-icon";
export type {
  AlertColorScheme,
  AlertProps,
  AlertRole,
  AlertSize,
  AlertVariant,
} from "./alert-root";
export type { AlertTitleProps } from "./alert-title";
