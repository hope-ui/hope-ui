// The `Alert` compound component. Each part lives in its own `alert-<part>.tsx` file (a shared
// `alert-context.ts` carries the context, `alert-icons.tsx` the built-in status glyphs); this barrel
// is the one place the namespace object is assembled — the component's single subpath export.
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
