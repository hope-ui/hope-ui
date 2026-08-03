// The `Popover` compound component — a styled, themeable layer over the headless `createPopover`
// hook family in `@hope-ui/primitives`. This barrel is the one place the namespace object is
// assembled, and the component's single published entry point.
//
// **Non-modal.** Nothing here traps focus, locks scroll, hides the page from assistive tech or blocks
// the pointer. It composes the positioning, dismissal, enter/exit-animation and focus-restore
// primitives directly rather than going through Dialog's modal machinery. A `modal` mode is later
// work.
import { Anchor } from "./popover-anchor";
import { Arrow } from "./popover-arrow";
import { CloseTrigger } from "./popover-close-trigger";
import { Content } from "./popover-content";
import { Description } from "./popover-description";
import { Header } from "./popover-header";
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
  Header,
  Title,
  Description,
  CloseTrigger,
};

export type { PopoverAnchorProps } from "./popover-anchor";
export type { PopoverArrowProps } from "./popover-arrow";
export type { PopoverCloseTriggerProps } from "./popover-close-trigger";
export type { PopoverContentProps } from "./popover-content";
export type { PopoverDescriptionProps } from "./popover-description";
export type { PopoverHeaderProps } from "./popover-header";
export type { PopoverPortalProps } from "./popover-portal";
export type { PopoverPositionerProps } from "./popover-positioner";
export type { PopoverRole, PopoverRootProps, PopoverSize } from "./popover-root";
export type { PopoverTitleProps } from "./popover-title";
export type { PopoverTriggerProps } from "./popover-trigger";
