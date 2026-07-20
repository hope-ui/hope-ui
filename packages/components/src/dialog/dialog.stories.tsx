import { Button, type ButtonProps } from "@hope-ui/components/button";
import type { JSX } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Dialog, type DialogPlacement, type DialogScrollBehavior, type DialogSize } from ".";

const meta = {
  title: "Components/Dialog",
  component: Dialog.Root,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Dialog.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// Dialog now ships its own visual identity (the hope `dialog` recipe), so the stories no longer
// hand-position the parts — the global `withHopeTheme` decorator (`.storybook/preview.tsx`) provides
// the preset, and Storybook's Tailwind build compiles the recipe's utilities.

/**
 * Renders a hope `Button` as the `Dialog.Trigger` via its `render` prop. Solid types a native
 * button's `disabled` wider than `Button` does (`boolean | ""` vs `boolean`), so the spread is cast —
 * the same bridge `Dialog.CloseTrigger` makes when it spreads onto `CloseButton`.
 */
function buttonTrigger(label: string) {
  return (p: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <Button {...(p as ButtonProps)}>{label}</Button>
  );
}

/** Background content, so click-through and focus-restore behavior are observable. */
function PageBehind() {
  return (
    <p style={{ padding: "1rem" }}>
      <button type="button" onClick={() => alert("You clicked the background.")}>
        Background button
      </button>
    </p>
  );
}

/** A short paragraph, repeated, so `scrollBehavior` has something to scroll. */
function LongBody() {
  return (
    <For each={Array.from({ length: 16 })}>
      {(_, i) => (
        <p>
          {i() + 1}. The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor
          jugs.
        </p>
      )}
    </For>
  );
}

/**
 * The canonical styled dialog: trigger → portal → scrim → a centered card with a header, body, and a
 * muted footer action row. `showCloseButton` defaults `true`, so a corner ✕ appears with no wiring.
 * Controlled here so the footer's Cancel/Delete can close it (v1 has no context escape hatch).
 */
function DialogDemo(props: {
  size?: DialogSize;
  placement?: DialogPlacement;
  scrollBehavior?: DialogScrollBehavior;
  role?: "dialog" | "alertdialog";
  showCloseButton?: boolean;
  modal?: boolean;
  longBody?: boolean;
  triggerLabel?: string;
}) {
  const [open, setOpen] = createSignal(false);
  return (
    <Dialog.Root
      open={open()}
      onOpenChange={setOpen}
      size={props.size}
      placement={props.placement}
      scrollBehavior={props.scrollBehavior}
      role={props.role}
      modal={props.modal}
    >
      <Dialog.Trigger render={buttonTrigger(props.triggerLabel ?? "Open dialog")} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content showCloseButton={props.showCloseButton}>
          <Dialog.Header>
            <Dialog.Title>Delete project</Dialog.Title>
            <Dialog.Description>
              This action cannot be undone. This permanently deletes the project and everything in
              it.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>
            {props.longBody ? (
              <LongBody />
            ) : (
              <p>Everything inside the project will be removed for all members.</p>
            )}
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="danger" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** The default: `md`, centered, inside-scroll, with the auto corner ✕. */
export const Default: Story = {
  render: () => (
    <>
      <PageBehind />
      <DialogDemo />
    </>
  ),
};

const SIZES: DialogSize[] = ["xs", "sm", "md", "lg", "xl", "cover", "full"];

/**
 * The `size` scale. `xs…xl` size the centered card; `cover` fills the viewport minus a margin
 * (keeping the radius), and `full` goes edge-to-edge with no radius — both ignore `placement`.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.75rem", padding: "1rem" }}>
      <For each={SIZES}>{(size) => <DialogDemo size={size} triggerLabel={size} />}</For>
    </div>
  ),
};

/** `placement="top"` anchors the card near the top of the viewport instead of dead-center. */
export const PlacementTop: Story = {
  name: "placement='top'",
  render: () => <DialogDemo placement="top" />,
};

/**
 * `scrollBehavior="inside"` (the default) caps the card height and scrolls the `body`, so the
 * header and footer stay pinned. The common case for long content.
 */
export const ScrollInside: Story = {
  name: "scrollBehavior='inside' (body scrolls, header/footer pinned)",
  render: () => <DialogDemo scrollBehavior="inside" longBody />,
};

/** `scrollBehavior="outside"` scrolls the whole card within the viewport instead. */
export const ScrollOutside: Story = {
  name: "scrollBehavior='outside' (whole card scrolls)",
  render: () => <DialogDemo scrollBehavior="outside" longBody />,
};

/** The APG alert dialog pattern. `role` is set on `Root` and threaded to `Content`. */
export const AlertDialog: Story = {
  name: "role='alertdialog'",
  render: () => <DialogDemo role="alertdialog" triggerLabel="Delete everything" />,
};

/** `showCloseButton={false}` omits the auto corner ✕ — the footer buttons are the only way out. */
export const WithoutCloseButton: Story = {
  name: "showCloseButton={false}",
  render: () => <DialogDemo showCloseButton={false} />,
};

/**
 * A non-dismissible dialog: `closeOnEscape={false}` + `closeOnInteractOutside={false}` (both set on
 * `Root`, forwarded to the primitive's dismiss layer). Neither Escape nor a scrim click closes it —
 * only the footer buttons and the corner ✕ do.
 */
export const NonDismissible: Story = {
  name: "Non-dismissible (closeOnEscape/closeOnInteractOutside false)",
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <Dialog.Root
        open={open()}
        onOpenChange={setOpen}
        closeOnEscape={false}
        closeOnInteractOutside={false}
      >
        <Dialog.Trigger render={buttonTrigger("Open non-dismissible")} />
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Confirm your choice</Dialog.Title>
              <Dialog.Description>Escape and outside clicks are disabled here.</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>You must use a button to leave.</Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="danger" onClick={() => setOpen(false)}>
                Confirm
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },
};

/**
 * A non-modal dialog: dismissable, and it still returns focus, but it never traps focus, locks
 * scroll, or makes the page behind inert. The background button stays clickable and in the
 * accessibility tree. Tab in, press Escape, and focus returns to the trigger.
 */
export const NonModal: Story = {
  name: "Non-modal (restores focus, page stays live)",
  render: () => (
    <>
      <PageBehind />
      <DialogDemo modal={false} triggerLabel="Open non-modal dialog" />
    </>
  ),
};

/**
 * A modal dialog with no `Dialog.Backdrop` at all. The page behind is still fully inert:
 * `Dialog.Portal` always renders the kernel's invisible `ModalBackdrop` when `modal`, and
 * `createHideOutside` marks everything outside the content `aria-hidden` and `inert`. Try clicking
 * the background button — nothing happens.
 */
export const ModalWithoutBackdrop: Story = {
  name: "Modal without Backdrop (background is inert)",
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <PageBehind />
        <Dialog.Root open={open()} onOpenChange={setOpen}>
          <Dialog.Trigger render={buttonTrigger("Open modal dialog")} />
          <Dialog.Portal>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Modal, no backdrop</Dialog.Title>
                <Dialog.Description>
                  The background button behind me is unreachable by pointer and by assistive
                  technology, even though I ship no backdrop.
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </>
    );
  },
};

/**
 * A modal `Dialog.Content` **must be positioned** — which the recipe does by default. This story
 * deliberately cancels that (`position: static`) to pin the failure mode: the pointer-blocking
 * `ModalBackdrop` is `position: fixed`, and CSS paints positioned elements above non-positioned ones
 * regardless of DOM order, so a static content ends up *beneath* it and its buttons stop responding
 * to the mouse. Escape still works. Don't "fix" this by deleting it — it documents the contract.
 */
export const UnpositionedContent: Story = {
  name: "Modal with an unpositioned Content (content is unclickable — by design)",
  render: () => (
    <>
      <PageBehind />
      <Dialog.Root>
        <Dialog.Trigger render={buttonTrigger("Open unpositioned dialog")} />
        <Dialog.Portal>
          <Dialog.Content style={{ position: "static", inset: "auto", transform: "none" }}>
            <Dialog.Header>
              <Dialog.Title>No position</Dialog.Title>
              <Dialog.Description>
                My corner ✕ is beneath the ModalBackdrop. Escape still works. Remove the inline
                `position: static` and the recipe's centering brings it back.
              </Dialog.Description>
            </Dialog.Header>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  ),
};

/**
 * A wrapper forwarding an unset optional prop passes `modal={undefined}`. `withDefaults` resolves
 * that with `??`, so the dialog stays modal. (Before Wave 1, `merge({ modal: true }, props)` let a
 * *present* `undefined` key beat the default and silently produced a non-modal dialog.)
 */
function WrappedDialog(props: { modal?: boolean }) {
  return <DialogDemo modal={props.modal} triggerLabel="Open wrapped dialog" />;
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
 * A dialog labelled by a heading that lives outside the content, with no `Dialog.Title`. `Content`'s
 * internal `aria-labelledby` falls back to the consumer's rather than overwriting it.
 */
export const LabelledByExternalHeading: Story = {
  name: "aria-labelledby without Dialog.Title",
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <Dialog.Root open={open()} onOpenChange={setOpen}>
        <h2 id="external-heading">Heading outside the content</h2>
        <Dialog.Trigger render={buttonTrigger("Open dialog")} />
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Content aria-labelledby="external-heading">
            <Dialog.Body>My accessible name comes from the heading outside me.</Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },
};
