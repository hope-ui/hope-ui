// The `Popover` compound component — a styled, themeable layer over the `createPopover` primitive
// hook family. Each part lives in its own `popover-<part>.tsx` file (a shared `popover-context.ts`
// carries the context that distributes the primitive state + the recipe slot fns); this barrel is the
// one place the namespace object is assembled — the component's single subpath export. Mirrors
// `src/dialog/`.
//
// **Non-modal.** Nothing here traps focus, locks scroll, hides the page or blocks the pointer: the
// layer composes `createFloating` + `createDismissable` + `createPresence` + `createFocusRestore`
// directly, never Dialog's modal machinery. A `modal` mode is later work.
import { Anchor } from "./popover-anchor";
import { Arrow } from "./popover-arrow";
import { CloseTrigger } from "./popover-close-trigger";
import { Content } from "./popover-content";
import { Description } from "./popover-description";
import { Portal } from "./popover-portal";
import { Positioner } from "./popover-positioner";
import { Root } from "./popover-root";
import { Title } from "./popover-title";
import { Trigger } from "./popover-trigger";

export const Popover = {
  Root,
  Trigger,
  Anchor,
  Portal,
  Positioner,
  Content,
  Arrow,
  Title,
  Description,
  CloseTrigger,
};

export type { PopoverAnchorProps } from "./popover-anchor";
export type { PopoverArrowProps } from "./popover-arrow";
export type { PopoverCloseTriggerProps } from "./popover-close-trigger";
export type { PopoverContentProps } from "./popover-content";
export type { PopoverDescriptionProps } from "./popover-description";
export type { PopoverPortalProps } from "./popover-portal";
export type { PopoverPositionerProps } from "./popover-positioner";
export type { PopoverRole, PopoverRootProps, PopoverSize } from "./popover-root";
export type { PopoverTitleProps } from "./popover-title";
export type { PopoverTriggerProps } from "./popover-trigger";
