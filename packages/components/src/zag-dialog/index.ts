// `ZagDialog` — a **spike**, not a shipping component: a feature-identical clone of
// `src/dialog/` whose behavior comes from `@zag-js/dialog` through the vendored Solid 2.0 adapter
// (`@hope-ui/primitives/zag-solid`) instead of the handmade `createDialog` family. It imports
// nothing from `@hope-ui/primitives/dialog`, shares the *same* `dialog` recipe, and exists to
// measure Zag adoption against a real component. See `__internal__/spikes/zag-dialog-findings.md`.
//
// It renders 12 parts to Dialog's 13 — there is no `ModalBackdrop`, because Zag blocks the page
// behind with `pointer-events: none` on `<body>` rather than with an element.
import { Backdrop } from "./zag-dialog-backdrop";
import { Body } from "./zag-dialog-body";
import { CloseTrigger } from "./zag-dialog-close-trigger";
import { Content } from "./zag-dialog-content";
import { Description } from "./zag-dialog-description";
import { Footer } from "./zag-dialog-footer";
import { Header } from "./zag-dialog-header";
import { Portal } from "./zag-dialog-portal";
import { Positioner } from "./zag-dialog-positioner";
import { Root } from "./zag-dialog-root";
import { Title } from "./zag-dialog-title";
import { Trigger } from "./zag-dialog-trigger";

export const ZagDialog = {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Positioner,
  Content,
  Header,
  Body,
  Footer,
  Title,
  Description,
  CloseTrigger,
};

export type { ZagDialogBackdropProps } from "./zag-dialog-backdrop";
export type { ZagDialogBodyProps } from "./zag-dialog-body";
export type { ZagDialogCloseTriggerProps } from "./zag-dialog-close-trigger";
export type { ZagDialogContentProps } from "./zag-dialog-content";
export type { ZagDialogDescriptionProps } from "./zag-dialog-description";
export type { ZagDialogFooterProps } from "./zag-dialog-footer";
export type { ZagDialogHeaderProps } from "./zag-dialog-header";
export type { ZagDialogPortalProps } from "./zag-dialog-portal";
export type { ZagDialogPositionerProps } from "./zag-dialog-positioner";
export type {
  DialogPlacement,
  DialogScrollBehavior,
  DialogSize,
  ZagDialogRole,
  ZagDialogRootProps,
} from "./zag-dialog-root";
export type { ZagDialogTitleProps } from "./zag-dialog-title";
export type { ZagDialogTriggerProps } from "./zag-dialog-trigger";
