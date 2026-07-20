import { Button, type ButtonProps } from "@hope-ui/components/button";
import type { JSX } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Dialog, type DialogPlacement, type DialogScrollBehavior, type DialogSize } from ".";

/**
 * `Dialog` ships its own visual identity (the hope `dialog` recipe), so these stories use the parts
 * as a consumer would — no hand-positioning. The global `withHopeTheme` decorator
 * (`.storybook/preview.tsx`) provides the preset, and Storybook's Tailwind build compiles the recipe
 * utilities. Opening a dialog zooms+fades it in; closing reverses it.
 */
const meta = {
  title: "Components/Dialog",
  component: Dialog.Root,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Dialog.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

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

/** Sixteen lines of filler, so `scrollBehavior` has something to scroll. */
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
 * The canonical styled dialog — trigger → scrim → a centered card with a header (title +
 * description), a body, and a muted footer action row, plus the auto corner ✕ (`showCloseButton`
 * defaults `true`). Controlled so the footer's Cancel/Delete can close it.
 */
function DialogDemo(props: {
  size?: DialogSize;
  placement?: DialogPlacement;
  scrollBehavior?: DialogScrollBehavior;
  showCloseButton?: boolean;
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
    >
      <Dialog.Trigger render={buttonTrigger(props.triggerLabel ?? "Open dialog")} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content showCloseButton={props.showCloseButton}>
            <Dialog.Header>
              <Dialog.Title>Delete project</Dialog.Title>
              <Dialog.Description>
                This permanently deletes <b>Acme Marketing Site</b> and everything inside it.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              {props.longBody ? (
                <LongBody />
              ) : (
                <p>Removed for every member of the workspace. This action cannot be undone.</p>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="danger" onClick={() => setOpen(false)}>
                Delete project
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** The default look: `md`, centered, inside-scroll, with a header, body, footer, and the corner ✕. */
export const Default: Story = {
  render: () => (
    <div style={{ padding: "2rem" }}>
      <DialogDemo />
    </div>
  ),
};

const SIZES: DialogSize[] = ["xs", "sm", "md", "lg", "xl", "cover", "full"];

/**
 * The `size` scale. `xs…xl` widen the centered card; `cover` fills the viewport minus a margin
 * (keeping the radius) and `full` goes edge-to-edge with no radius — both ignore `placement`.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.75rem", padding: "2rem" }}>
      <For each={SIZES}>{(size) => <DialogDemo size={size} triggerLabel={size} />}</For>
    </div>
  ),
};

/** `placement="top"` anchors the card near the top of the viewport instead of dead-center. */
export const PlacementTop: Story = {
  name: "placement='top'",
  render: () => (
    <div style={{ padding: "2rem" }}>
      <DialogDemo placement="top" triggerLabel="Open top-placed dialog" />
    </div>
  ),
};

/**
 * `scrollBehavior="inside"` (the default) caps the card height and scrolls the body, so the header
 * and footer stay pinned while long content scrolls between them.
 */
export const ScrollInside: Story = {
  name: "scrollBehavior='inside' (body scrolls, header/footer pinned)",
  render: () => (
    <div style={{ padding: "2rem" }}>
      <DialogDemo scrollBehavior="inside" longBody triggerLabel="Open long dialog" />
    </div>
  ),
};

/**
 * `scrollBehavior="outside"` makes the `Dialog.Positioner` (the fixed full-viewport frame) the scroll
 * container instead, so the whole card scrolls within the viewport while the card keeps its natural
 * height. A short card stays centered; a tall one anchors to the top and is fully scroll-reachable.
 */
export const ScrollOutside: Story = {
  name: "scrollBehavior='outside' (whole card scrolls)",
  render: () => (
    <div style={{ padding: "2rem" }}>
      <DialogDemo scrollBehavior="outside" longBody triggerLabel="Open long dialog" />
    </div>
  ),
};

/** `showCloseButton={false}` drops the auto corner ✕ — the footer buttons are the only way out. */
export const WithoutCloseButton: Story = {
  name: "showCloseButton={false}",
  render: () => (
    <div style={{ padding: "2rem" }}>
      <DialogDemo showCloseButton={false} />
    </div>
  ),
};

/**
 * The APG alert dialog pattern for a destructive confirmation: `role="alertdialog"` (set on `Root`,
 * threaded to `Content`), no corner ✕, and the two footer actions as the only exits.
 */
export const AlertDialog: Story = {
  name: "role='alertdialog' (destructive confirmation)",
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <div style={{ padding: "2rem" }}>
        <Dialog.Root role="alertdialog" open={open()} onOpenChange={setOpen}>
          <Dialog.Trigger render={buttonTrigger("Delete account")} />
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content showCloseButton={false}>
                <Dialog.Header>
                  <Dialog.Title>Delete your account?</Dialog.Title>
                  <Dialog.Description>
                    This erases your profile, projects, and billing history. It cannot be undone.
                  </Dialog.Description>
                </Dialog.Header>
                <Dialog.Footer>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Keep account
                  </Button>
                  <Button colorScheme="danger" onClick={() => setOpen(false)}>
                    Delete account
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    );
  },
};

/**
 * A realistic form dialog. The fields live in a `<form>` in the body; the footer's Save button is
 * linked to it via the `form` attribute, so it submits from outside the `<form>` element. The first
 * field receives focus on open (the focus trap's first-focusable default), and Tab cycles the card.
 */
export const WithForm: Story = {
  name: "With a form",
  render: () => {
    const [open, setOpen] = createSignal(false);
    const field =
      "w-full rounded-md border border-subtle bg-transparent px-3 py-2 text-sm text-foreground outline-none";
    return (
      <div style={{ padding: "2rem" }}>
        <Dialog.Root open={open()} onOpenChange={setOpen} size="sm">
          <Dialog.Trigger render={buttonTrigger("Edit profile")} />
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Edit profile</Dialog.Title>
                  <Dialog.Description>
                    Update your details. Changes save on submit.
                  </Dialog.Description>
                </Dialog.Header>
                <Dialog.Body>
                  <form
                    id="edit-profile-form"
                    class="flex flex-col gap-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      setOpen(false);
                    }}
                  >
                    <label class="flex flex-col gap-1 text-sm font-medium text-foreground">
                      Name
                      <input class={field} value="Ada Lovelace" />
                    </label>
                    <label class="flex flex-col gap-1 text-sm font-medium text-foreground">
                      Email
                      <input class={field} type="email" value="ada@example.com" />
                    </label>
                  </form>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" form="edit-profile-form">
                    Save changes
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    );
  },
};

/**
 * A non-dismissible dialog: `closeOnEscape={false}` + `closeOnInteractOutside={false}` (both set on
 * `Root`, forwarded to the primitive's dismiss layer). Neither Escape nor a scrim click closes it —
 * only a footer button does.
 */
export const NonDismissible: Story = {
  name: "Non-dismissible (closeOnEscape/closeOnInteractOutside false)",
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <div style={{ padding: "2rem" }}>
        <Dialog.Root
          open={open()}
          onOpenChange={setOpen}
          closeOnEscape={false}
          closeOnInteractOutside={false}
        >
          <Dialog.Trigger render={buttonTrigger("Accept the terms")} />
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content showCloseButton={false}>
                <Dialog.Header>
                  <Dialog.Title>Before you continue</Dialog.Title>
                  <Dialog.Description>
                    Escape and outside clicks are disabled — you must choose a button.
                  </Dialog.Description>
                </Dialog.Header>
                <Dialog.Body>
                  <p>By continuing you agree to the terms of service and privacy policy.</p>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Decline
                  </Button>
                  <Button onClick={() => setOpen(false)}>Accept</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    );
  },
};
