// The `Dialog` compound component — a styled, themeable layer over the `createDialog` primitive hook
// family. Each part lives in its own `dialog-<part>.tsx` file (a shared `dialog-context.ts` carries
// the context that distributes the recipe slot fns + `role`); this barrel is the one place the
// namespace object is assembled — the component's single subpath export. Mirrors `src/alert/`.
import { Backdrop } from "./dialog-backdrop";
import { CloseTrigger } from "./dialog-close-trigger";
import { Content } from "./dialog-content";
import { Description } from "./dialog-description";
import { Portal } from "./dialog-portal";
import { Root } from "./dialog-root";
import { Title } from "./dialog-title";
import { Trigger } from "./dialog-trigger";

export const Dialog = {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Content,
  Title,
  Description,
  CloseTrigger,
};

export type { DialogBackdropProps } from "./dialog-backdrop";
export type { DialogCloseTriggerProps } from "./dialog-close-trigger";
export type { DialogContentProps } from "./dialog-content";
export type { DialogDescriptionProps } from "./dialog-description";
export type { DialogPortalProps } from "./dialog-portal";
export type {
  DialogPlacement,
  DialogRole,
  DialogRootProps,
  DialogScrollBehavior,
  DialogSize,
} from "./dialog-root";
export type { DialogTitleProps } from "./dialog-title";
export type { DialogTriggerProps } from "./dialog-trigger";
