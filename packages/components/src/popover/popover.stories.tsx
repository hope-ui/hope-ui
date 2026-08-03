import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Dialog } from "@hope-ui/components/dialog";
import type { JSX } from "@solidjs/web";
import { createSignal, For, Show } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Popover, type PopoverSize } from ".";

/**
 * `Popover` ships its own visual identity (the hope `popover` recipe), so these stories use the parts
 * as a consumer would — no hand-positioning: `createFloating` measures the layer and writes its
 * position inline, and the recipe styles the card. The global `withHopeTheme` decorator
 * (`.storybook/preview.tsx`) provides the preset, and Storybook's Tailwind build compiles the recipe
 * utilities.
 *
 * It is **non-modal**: nothing traps focus, locks scroll or blocks the pointer. Click the trigger to
 * toggle, Escape to close, click outside or Tab away to dismiss.
 */
const meta = {
  title: "Components/Popover",
  component: Popover.Root,
} satisfies Meta<typeof Popover.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Renders a hope `Button` as the `Popover.Trigger` via its `render` prop. Solid types a native
 * button's `disabled` wider than `Button` does (`boolean | ""` vs `boolean`), so the spread is cast —
 * the same bridge `Popover.CloseTrigger` makes when it spreads onto `CloseButton`.
 */
function buttonTrigger(label: string) {
  return (p: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <Button {...(p as ButtonProps)}>{label}</Button>
  );
}

interface PopoverDemoProps {
  size?: PopoverSize;
  side?: "top" | "right" | "bottom" | "left" | "inline-start" | "inline-end";
  align?: "start" | "center" | "end";
  triggerLabel?: string;
  /** Drop the arrow — a popover reads fine without one when it sits far from its trigger. */
  withoutArrow?: boolean;
  closeOnFocusOutside?: boolean;
  children?: JSX.Element;
  /** Written straight onto the Positioner as a forwarded native attribute (see `RTL` below). */
  dir?: "ltr" | "rtl";
}

/** The canonical styled popover: trigger → measured layer → card with an arrow, title and body. */
function PopoverDemo(props: PopoverDemoProps) {
  return (
    <Popover.Root
      size={props.size}
      side={props.side}
      align={props.align}
      closeOnFocusOutside={props.closeOnFocusOutside}
    >
      <Popover.Trigger render={buttonTrigger(props.triggerLabel ?? "Open popover")} />
      <Popover.Portal>
        <Popover.Positioner dir={props.dir}>
          <Popover.Content>
            <Show when={!props.withoutArrow}>
              <Popover.Arrow />
            </Show>
            <Popover.Title>Share this page</Popover.Title>
            {props.children ?? (
              <Popover.Description>
                Anyone with the link can view it. Change this in{" "}
                <a href="#project-settings">project settings</a>.
              </Popover.Description>
            )}
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** The default look: `md`, below the trigger, centered, with an arrow. */
export const Default: Story = {
  render: () => <PopoverDemo />,
};

/**
 * `Popover.Header` — the optional column that groups the title and the description. It earns its place
 * once the card holds a *second* region: the header's own gap is tighter than the one `size` puts
 * between regions, so the labelled text reads as one block set apart from the row below it instead of
 * as three evenly spaced siblings. Compare with `Default`, which is title + description alone and
 * wants no header at all.
 *
 * Pure layout — the labelling still rides on Title and Description, which register their ids with the
 * content hook wherever they are nested.
 */
export const WithAHeader: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger render={buttonTrigger("Share this page")} />
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Header>
              <Popover.Title>Share this page</Popover.Title>
              <Popover.Description>Anyone with the link can view it.</Popover.Description>
            </Popover.Header>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                readonly
                value="hope-ui.dev/s/8fk2"
                aria-label="Share link"
                class="w-full rounded-md border border-subtle bg-surface px-2 py-1 text-sm text-foreground"
              />
              <Button size="sm">Copy</Button>
            </div>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  ),
};

const SIZES: PopoverSize[] = ["sm", "md", "lg"];

/** The `size` scale — the card's max width, its padding, and both of its gaps (regions, and header). */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      <For each={SIZES}>{(size) => <PopoverDemo size={size} triggerLabel={size} />}</For>
    </div>
  ),
};

/**
 * `matchAnchorWidth` pins the card to the trigger's measured width instead of letting it shrink-wrap.
 * The card's `size` cap does not apply here — a matched card is never narrower than what it points at,
 * which is the whole promise — so `size` keeps only its padding and gaps. Widen the browser and the
 * wide trigger below stretches its card with it, live: `createFloating` re-measures on every
 * `autoUpdate` tick and republishes `--anchor-width` on the positioner.
 *
 * The same measurement is available to CSS on any popover, matched or not — `--anchor-width`,
 * `--anchor-height`, `--available-width`, `--available-height` — so a card that wants a floor rather
 * than an exact match writes `min-w-(--anchor-width)` on the Positioner itself.
 */
export const MatchAnchorWidth: Story = {
  // A matched card is as tall as it is wide is unusual — it covers whatever sits right below it — so
  // the two demos are spaced far enough apart that both triggers stay clickable while one is open.
  parameters: { layout: "fullscreen" },
  render: () => (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        gap: "9rem",
        width: "24rem",
        padding: "3rem 2rem",
      }}
    >
      <Popover.Root matchAnchorWidth>
        <Popover.Trigger
          render={(p) => (
            <Button {...(p as ButtonProps)} fullWidth>
              A wide trigger — the card matches it
            </Button>
          )}
        />
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Title>Share this page</Popover.Title>
              <Popover.Description>
                Anyone with the link can view it. This card is as wide as the button above, past the
                `md` size's own cap.
              </Popover.Description>
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {/* The contrast: same content, same size, shrink-wrapped and capped instead. */}
      <PopoverDemo triggerLabel="Shrink-wrapped (the default)" />
    </div>
  ),
};

const SIDES = ["top", "right", "bottom", "left"] as const;

/**
 * The four physical sides. `data-side` reports where the layer **landed** — so the card slides in
 * from the trigger's direction and scales out of the edge nearest it, and the arrow re-pins itself,
 * all from one attribute.
 *
 * The arrow's **border** keys on `data-side` too: it carries the card's hairline around its two
 * *outward* edges, so the border no longer stops dead where the arrow covers it. **This story is the
 * only place a swapped pair is catchable** — the automated tests compile no Tailwind, so every check
 * passes on an arrow pointing the wrong way. What to look for: all four point *away* from their card,
 * and the hairline runs continuously through both elbows. A wrong adjacent pair points back *into*
 * the card; an opposite pair paints two parallel bars instead of a point. Under `dir="rtl"` (the
 * `RTL` story) the pair must be **identical**, never mirrored.
 */
export const Sides: Story = {
  // Fullscreen + generous gaps: at the default centered layout the four demos sit shoulder to
  // shoulder and each card covers its neighbours, which is exactly the thing this story is for.
  parameters: { layout: "fullscreen" },
  render: () => (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        gap: "8rem",
        padding: "8rem 2rem",
      }}
    >
      <For each={SIDES}>{(side) => <PopoverDemo side={side} triggerLabel={side} />}</For>
    </div>
  ),
};

/** `align` skids the card along the side's cross axis. */
export const Alignment: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      <For each={["start", "center", "end"] as const}>
        {(align) => <PopoverDemo align={align} triggerLabel={align} />}
      </For>
    </div>
  ),
};

/**
 * A **logical** `side` under `dir="rtl"`. `inline-start` resolves against the direction the layer is
 * actually rendered into, so it lands on the *right* here — and `data-side` still reports the
 * physical `right`, because where the box landed is geometry.
 *
 * Popover writes **no locale-derived `dir`**: the attribute below is an ordinary forwarded native
 * attribute on the Positioner. A portaled layer inherits direction from `document.body`, so there is
 * nothing to repair, and stamping `dir="ltr"` from an en-US locale would override the app's own
 * `dir="rtl"`. This story fails loudly if that forwarding ever regresses.
 */
export const RTL: Story = {
  render: () => (
    <div dir="rtl" style={{ display: "flex", gap: "0.75rem" }}>
      <PopoverDemo side="inline-start" dir="rtl" triggerLabel="inline-start" />
      <PopoverDemo side="inline-end" dir="rtl" triggerLabel="inline-end" />
    </div>
  ),
};

/**
 * Anchored hard against the viewport edges, so `flip` and `shift` have something to react to: the
 * card swaps to the opposite side rather than overflowing, and slides along its alignment axis to
 * stay in view. `data-side` follows the flip, so the animation and the arrow follow it too.
 */
export const CollisionHandling: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div style={{ height: "100vh", position: "relative" }}>
      <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem" }}>
        <PopoverDemo side="top" triggerLabel="top-left" />
      </div>
      <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}>
        <PopoverDemo side="top" align="end" triggerLabel="top-right" />
      </div>
      <div style={{ position: "absolute", bottom: "0.5rem", left: "0.5rem" }}>
        <PopoverDemo side="bottom" triggerLabel="bottom-left" />
      </div>
      <div style={{ position: "absolute", bottom: "0.5rem", right: "0.5rem" }}>
        <PopoverDemo side="bottom" align="end" triggerLabel="bottom-right" />
      </div>
    </div>
  ),
};

/**
 * Inside a scroll container. `Popover.Portal` lifts the layer out of the container's overflow (so it
 * is never clipped) while `autoUpdate` keeps it glued to the trigger as the container scrolls.
 */
export const InsideAScrollContainer: Story = {
  render: () => (
    <div class="h-64 w-80 overflow-y-auto rounded-lg border border-subtle p-4">
      <div class="h-40" />
      <PopoverDemo triggerLabel="Scroll me, then open" />
      <div class="h-96" />
    </div>
  ),
};

/** Without the arrow — the card is just a floating surface. */
export const WithoutAnArrow: Story = {
  render: () => <PopoverDemo withoutArrow triggerLabel="No arrow" />,
};

/**
 * A **too-narrow anchor**. The arrow can only travel as far as `arrowPadding`, so against a 4px-wide
 * trigger it can no longer point at the anchor's centre honestly — the primitive says so with
 * `data-uncentered`, and hope's recipe answers by hiding it (`data-uncentered:invisible`) rather than
 * leaving a square pointing at nothing. Another preset could decide otherwise.
 */
export const ClampedArrow: Story = {
  // The trigger has to sit hard against the viewport's inline-start edge, not just be narrow: it is
  // `shift` pulling the card back inside the `collisionPadding` gutter that leaves the arrow unable
  // to reach the anchor's centre. On a *centred* narrow anchor the arrow lands on it perfectly, and
  // floating-ui folds the clamp of an `align`ed one into its own `alignmentOffset` — neither is
  // uncentered.
  parameters: { layout: "fullscreen" },
  render: () => (
    <div style={{ height: "100vh", display: "flex", "align-items": "center" }}>
      <Popover.Root>
        <Popover.Trigger class="h-6 w-1 rounded-full bg-primary" aria-label="Open details" />
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Title>Nothing to point at</Popover.Title>
              <Popover.Description>
                The card was pushed off its 4px anchor by the viewport edge, so the arrow is clamped
                and hides itself.
              </Popover.Description>
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  ),
};

/**
 * A separate `Popover.Anchor`. The layer positions against the whole card while the trigger inside it
 * keeps owning the toggle and the ARIA — the escape hatch for "anchored to the row, opened by the
 * button". Unmounting the anchor hands positioning back to the trigger.
 */
export const CustomAnchor: Story = {
  render: () => (
    <Popover.Root side="right" align="start">
      <Popover.Anchor class="flex w-72 items-center justify-between rounded-lg border border-subtle p-4">
        <span class="text-sm text-foreground">Acme Marketing Site</span>
        <Popover.Trigger render={buttonTrigger("Details")} />
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Title>Acme Marketing Site</Popover.Title>
            <Popover.Description>
              Anchored to the whole row, not to the button that opened it.
            </Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  ),
};

/**
 * A form inside, and the one story that exercises `initialFocus`. Left alone, opening the popover
 * focuses its **first focusable descendant** — here the corner `Popover.CloseTrigger`, when a reader
 * who opened "Rename project" wants the caret in the field. `initialFocus` takes an accessor,
 * resolved after the content mounts, so it can point at an element inside the popup. Closing still
 * returns focus to the trigger.
 */
export const WithAForm: Story = {
  render: () => {
    const [name, setName] = createSignal("Acme Marketing Site");
    const [nameInput, setNameInput] = createSignal<HTMLInputElement>();
    return (
      <Popover.Root size="lg">
        <Popover.Trigger render={buttonTrigger("Rename project")} />
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Content initialFocus={nameInput}>
              <Popover.Arrow />
              <Popover.Title>Rename project</Popover.Title>
              <Popover.CloseTrigger />
              <label class="flex flex-col gap-1 text-sm text-foreground-muted" for="project-name">
                Project name
                <input
                  ref={setNameInput}
                  id="project-name"
                  class="w-full rounded-md border border-subtle bg-surface px-2 py-1 text-sm text-foreground"
                  value={name()}
                  onInput={(event) => setName(event.currentTarget.value)}
                />
              </label>
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    );
  },
};

/**
 * `closeOnFocusOutside={false}`. Tab-ing away leaves the layer open — for a popover the reader is
 * meant to keep referring to while working elsewhere. Escape, an outside click and the trigger all
 * still close it.
 */
export const StaysOpenOnFocusOut: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", "align-items": "center" }}>
      <PopoverDemo closeOnFocusOutside={false} triggerLabel="Open, then Tab away" />
      <Button variant="ghost">Somewhere else</Button>
    </div>
  ),
};

/**
 * **Inside a Dialog — a layer above the modal.**
 *
 * Default props on both roots, which is the whole point. A `Popover.Portal` mounts its layer as a
 * *sibling* of the dialog's, so by every DOM measure the popup sits outside the modal's content —
 * and a modal Dialog marks everything outside that content `inert` + `aria-hidden`, cages focus
 * inside it, and listens for Escape on the document. Three things make the popup a layer *above* the
 * modal rather than a casualty of it:
 *
 * - **The card stays reachable.** The popover registers itself with the innermost open modal, which
 *   then spares it and its whole subtree. Not merely legible — *hit-testable*: `inert` is
 *   transparent to hit testing while changing nothing about how an element paints, so without this
 *   the popover looks perfectly normal and no click reaches a word of it.
 * - **Focus lands inside it and stays.** The popover opens a focus scope above the dialog's, and the
 *   dialog's trap consults that stack rather than its own `contains` — focus in a layer opened above
 *   it is not focus escaping. Without it, the trap yanks focus back, `closeOnFocusOutside` reads the
 *   yank as focus leaving, and the card is gone in ~3ms.
 * - **Escape walks down one layer at a time.** Only the topmost layer consumes an Escape or an
 *   outside pointerdown: the first Escape closes the popover, the second the dialog, and a backdrop
 *   click closes the dialog alone. `bubbles` opts back in per event channel for a consumer who wants
 *   one keystroke to take the whole chain.
 *
 * Focus follows that chain back down: each layer hands it to the button that opened it. Executable
 * form: `__tests__/popover-in-dialog.browser.test.tsx`.
 */
export const InsideADialog: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger render={buttonTrigger("Open dialog")} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Project settings</Dialog.Title>
              <Dialog.Description>
                The popover below opens above the modal, stays clickable, and takes the first Escape
                on its own.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <PopoverDemo triggerLabel="Open popover" />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  ),
};
