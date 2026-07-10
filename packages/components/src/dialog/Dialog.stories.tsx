import type { JSX } from "@solidjs/web";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Dialog } from "./Dialog";

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
          <Dialog.Popup style={popupStyle}>
            <Dialog.Title>Dialog title</Dialog.Title>
            <Dialog.Description>Dialog description</Dialog.Description>
            <Dialog.Close>Close</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  ),
};

/**
 * KNOWN BROKEN — Wave 2 (finding 5). `modal={false}` disables the focus trap, and because
 * focus *restore* lives inside `createFocusTrap`'s cleanup, it disables restore too. Open
 * this with the keyboard, press Escape, and observe focus land on `<body>` instead of
 * returning to the trigger. `Dialog.md`'s keyboard table promises otherwise.
 */
export const NonModal: Story = {
  name: "Non-modal (focus is not restored — known bug)",
  render: () => (
    <>
      <PageBehind />
      <Dialog.Root modal={false}>
        <Dialog.Trigger>Open non-modal dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Popup style={popupStyle}>
            <Dialog.Title>Non-modal</Dialog.Title>
            <Dialog.Description>
              Escape should return focus to the trigger. It doesn't.
            </Dialog.Description>
            <Dialog.Close>Close</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  ),
};

/**
 * KNOWN BROKEN — Wave 2 (finding 6). `Dialog.Backdrop` is optional, and nothing else makes
 * outside content inert: no `inert`, no `aria-hidden`, no pointer-event blocking. With the
 * dialog open, the background button is still clickable. `aria-modal="true"` alone does not
 * stop a pointer, and has known VoiceOver/Safari gaps for assistive tech too.
 */
export const ModalWithoutBackdrop: Story = {
  name: "Modal without Backdrop (background is clickable — known bug)",
  render: () => (
    <>
      <PageBehind />
      <Dialog.Root>
        <Dialog.Trigger>Open modal dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Popup style={popupStyle}>
            <Dialog.Title>Modal, no backdrop</Dialog.Title>
            <Dialog.Description>Try clicking the background button behind me.</Dialog.Description>
            <Dialog.Close>Close</Dialog.Close>
          </Dialog.Popup>
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
    <Dialog.Root>
      <Dialog.Trigger>Delete everything</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop style={backdropStyle} />
        <Dialog.Popup role="alertdialog" style={popupStyle}>
          <Dialog.Title>Are you sure?</Dialog.Title>
          <Dialog.Description>This cannot be undone.</Dialog.Description>
          <Dialog.Close>Cancel</Dialog.Close>
        </Dialog.Popup>
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
        <Dialog.Popup aria-labelledby="external-heading" style={popupStyle}>
          <Dialog.Description>My accessible name should come from outside.</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
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
        <Dialog.Popup style={popupStyle}>
          <Dialog.Title>Wrapped</Dialog.Title>
          <Dialog.Description>
            I'm modal by default, even though my wrapper forwarded `modal={undefined}`.
          </Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
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
        <Dialog.Popup id="my-popup" style={popupStyle}>
          <Dialog.Title>Pinned id</Dialog.Title>
          <Dialog.Description>Inspect the trigger's aria-controls.</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  ),
};
