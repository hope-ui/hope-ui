import type { JSX } from "@solidjs/web";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Dialog } from ".";

const meta = {
  title: "Components/Dialog",
  component: Dialog.Root,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Dialog.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// Dialog is headless — it ships no styles at all. Stories supply the minimum needed to see
// and click things. `Popup` must be positioned: a `position: fixed` Backdrop creates a
// stacking context and paints above a static Popup regardless of DOM order.
const backdropStyle: JSX.CSSProperties = {
  position: "fixed",
  inset: "0",
  "background-color": "rgb(0 0 0 / 50%)",
};

const popupStyle: JSX.CSSProperties = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  "background-color": "white",
  color: "#111",
  padding: "1.5rem",
  "border-radius": "0.5rem",
  "min-width": "20rem",
};

/** Background content, so click-through and focus-restore behavior are observable. */
function PageBehind() {
  return (
    <p>
      <button type="button" onClick={() => alert("You clicked the background.")}>
        Background button
      </button>
    </p>
  );
}

export const Default: Story = {
  render: () => (
    <>
      <PageBehind />
      <Dialog.Root>
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop style={backdropStyle} />
          <Dialog.Content style={popupStyle}>
            <Dialog.Title>Dialog title</Dialog.Title>
            <Dialog.Description>Dialog description</Dialog.Description>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  ),
};

/**
 * A non-modal dialog: dismissable, and it still returns focus, but it never traps focus,
 * locks scroll, or makes the page behind inert. The background button stays clickable and
 * stays in the accessibility tree.
 *
 * Tab into the dialog, press Escape, and focus returns to the trigger. Restore lives in
 * `createFocusRestore`, gated on `open()`; the trap is separate and gated on
 * `open() && modal()`. (Before Wave 2 restore lived *inside* `createFocusTrap`'s cleanup, so
 * a non-modal dialog stranded focus on `<body>` — an APG violation.)
 */
export const NonModal: Story = {
  name: "Non-modal (restores focus, page stays live)",
  render: () => (
    <>
      <PageBehind />
      <Dialog.Root modal={false}>
        <Dialog.Trigger>Open non-modal dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content style={popupStyle}>
            <Dialog.Title>Non-modal</Dialog.Title>
            <Dialog.Description>
              Tab to me, then press Escape: focus returns to the trigger. The background button
              behind me still works.
            </Dialog.Description>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  ),
};

/**
 * A modal dialog with no `Dialog.Backdrop` at all. The page behind is still fully inert:
 * `Dialog.Portal` always renders the kernel's invisible `ModalBackdrop` when `modal`, and
 * `createHideOutside` marks everything outside the popup `aria-hidden` and `inert`.
 *
 * Try clicking the background button — nothing happens. Open the a11y addon panel: the
 * background is out of the accessibility tree, and only the dialog is reachable.
 * (Before Wave 2, `aria-modal="true"` was the whole story, and a mouse clicked straight
 * through.)
 */
export const ModalWithoutBackdrop: Story = {
  name: "Modal without Backdrop (background is inert)",
  render: () => (
    <>
      <PageBehind />
      <Dialog.Root>
        <Dialog.Trigger>Open modal dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content style={popupStyle}>
            <Dialog.Title>Modal, no backdrop</Dialog.Title>
            <Dialog.Description>
              Try clicking the background button behind me. It's unreachable by pointer and by
              assistive technology, even though I ship no backdrop.
            </Dialog.Description>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  ),
};

/**
 * A modal `Dialog.Content` **must be positioned**. The pointer-blocking `ModalBackdrop` is
 * `position: fixed`, and CSS paints positioned elements above non-positioned ones regardless
 * of DOM order — so a `position: static` popup ends up *underneath* it and its own buttons
 * stop responding to the mouse. Every other story positions the popup; this one doesn't, on
 * purpose, so the failure mode is visible somewhere.
 */
export const UnpositionedModalPopup: Story = {
  name: "Modal with an unpositioned Popup (content is unclickable — by design)",
  render: () => (
    <>
      <PageBehind />
      <Dialog.Root>
        <Dialog.Trigger>Open unpositioned dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content style={{ "background-color": "white", color: "#111", padding: "1.5rem" }}>
            <Dialog.Title>No position</Dialog.Title>
            <Dialog.Description>
              My Close button is beneath the ModalBackdrop. Escape still works. Give the popup
              `position: fixed` and it comes back.
            </Dialog.Description>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  ),
};

/**
 * The APG alert dialog pattern. `Popup`'s internal `role` falls back to the consumer's, so
 * `role="alertdialog"` survives. (Before Wave 1 it was silently overwritten with `"dialog"`.)
 */
export const AlertDialog: Story = {
  name: "role='alertdialog' (APG alert dialog pattern)",
  render: () => (
    <Dialog.Root role="alertdialog">
      <Dialog.Trigger>Delete everything</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop style={backdropStyle} />
        <Dialog.Content style={popupStyle}>
          <Dialog.Title>Are you sure?</Dialog.Title>
          <Dialog.Description>This cannot be undone.</Dialog.Description>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  ),
};

/**
 * A dialog labelled by a heading that lives outside the popup, with no `Dialog.Title`.
 * `Popup`'s internal `aria-labelledby` falls back to the consumer's rather than
 * overwriting it. (Before Wave 1 the name was silently dropped and the a11y panel reported
 * `aria-dialog-name`.)
 */
export const LabelledByExternalHeading: Story = {
  name: "aria-labelledby without Dialog.Title",
  render: () => (
    <Dialog.Root>
      <h2 id="external-heading">Heading outside the popup</h2>
      <Dialog.Trigger>Open dialog</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop style={backdropStyle} />
        <Dialog.Content aria-labelledby="external-heading" style={popupStyle}>
          <Dialog.Description>My accessible name should come from outside.</Dialog.Description>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  ),
};

/**
 * A wrapper forwarding an unset optional prop passes `modal={undefined}`. `withDefaults`
 * resolves that with `??`, so the dialog stays modal. (Before Wave 1, `merge({ modal: true },
 * props)` let a *present* `undefined` key beat the default and silently produced a
 * non-modal dialog: no focus trap, no scroll lock, no `aria-modal`.)
 */
function WrappedDialog(props: { modal?: boolean }) {
  return (
    <Dialog.Root modal={props.modal}>
      <Dialog.Trigger>Open wrapped dialog</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop style={backdropStyle} />
        <Dialog.Content style={popupStyle}>
          <Dialog.Title>Wrapped</Dialog.Title>
          <Dialog.Description>
            I'm modal by default, even though my wrapper forwarded `modal={undefined}`.
          </Dialog.Description>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const WrapperForwardingUndefinedModal: Story = {
  name: "Wrapper forwarding modal={undefined} (stays modal)",
  render: () => (
    <>
      <PageBehind />
      <WrappedDialog />
    </>
  ),
};

/**
 * A consumer-pinned popup `id`. `Popup` registers it with `Root`, so `Trigger`'s
 * `aria-controls` names the element that actually exists rather than a generated id.
 */
export const CustomPopupId: Story = {
  name: "Consumer-supplied popup id (aria-controls follows)",
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger>Open dialog</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop style={backdropStyle} />
        <Dialog.Content id="my-popup" style={popupStyle}>
          <Dialog.Title>Pinned id</Dialog.Title>
          <Dialog.Description>Inspect the trigger's aria-controls.</Dialog.Description>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  ),
};
