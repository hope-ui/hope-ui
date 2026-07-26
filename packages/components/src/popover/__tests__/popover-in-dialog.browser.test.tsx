import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import type { Component } from "solid-js";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Dialog } from "../../dialog";
import { Popover } from "../index";

/**
 * **A Popover opened inside a modal Dialog — every assertion here is written against the FIXED
 * behavior, so this whole file is red until the nested-overlay ports land.** It is the executable
 * form of `popover.stories.tsx`'s `InsideADialog`, which pinned the breakage in a doc comment; a
 * doc comment fails nothing.
 *
 * The breakage is **four** independent mechanisms, each needing a different registry, and each test
 * below names the one it measures:
 *
 * 1. **Escape / outside-pointerdown reach every open layer.** `create-dismissable.ts` attaches to
 *    `document` per instance with no ordering guard, so both layers dismiss at once.
 * 2. **Focus is then lost with it** — two focus restores fire for triggers that are both
 *    unmounting. Measured against this harness the survivor is the *dialog's* trigger, not
 *    `<body>`: the popover restores first, onto a trigger that the dialog's own unmount is about to
 *    take with it, and the dialog's restore lands last and wins. Either way the popover trigger —
 *    the control the reader actually pressed — does not get focus back.
 * 3. **The Dialog's `MutationObserver` marks the Popover `inert` + `aria-hidden`.**
 *    `create-hide-outside.ts` hides every added `<body>` child not in that layer's *static* `spare`
 *    array, and the Popover's portal is one. The card still paints **on top**, undimmed and
 *    legible — it is `inert` making it transparent to hit testing that breaks it, so
 *    `elementFromPoint` at its own centre returns whatever is underneath. It looks like a working
 *    popover and cannot be touched.
 * 4. **The Dialog's focus trap yanks focus back out of the Popover.** `create-focus-trap.ts`
 *    refocuses its container whenever focus lands outside it, portaled popup included, and the
 *    Popover reads that as focus leaving and dismisses itself. This is what the story's
 *    `closeOnFocusOutside={false}` hides — **so the harness here carries default props**, and the
 *    prop is deliberately absent.
 *
 * Everything the assertions rest on was measured in this project, not assumed: the `browser`
 * project loads **no compiled Tailwind** and its viewport is **414×896**, so every recipe class is
 * an inert string and both layers need an inline box; a programmatic `.click()` fires no
 * pointerdown and no focus, so every interaction here goes through `userEvent`.
 */

// Both families read a recipe (`Dialog.CloseTrigger` renders a recipe-styled `CloseButton`), so
// every tree here sits under a `<ThemeProvider>` fed the `hope` preset. Zero-DOM provider — its
// token values live in CSS — so it changes nothing these assertions look at.
function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

/**
 * The dialog's box, pinned to the top of the viewport and only 180px tall, so the popover's card
 * (opened from a trigger at y=300) never overlaps it. That separation is what lets
 * {@link topmostElementOver} distinguish "the card is hit-testable" from "the card is inert and the
 * hit fell through to the dialog above it" — two different answers that would be one if they
 * overlapped.
 */
const DIALOG_POSITIONER_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "0px",
  left: "0px",
  width: "100%",
  height: "180px",
};

/**
 * Positioned, because a modal popup must be — an unpositioned one paints *beneath* the
 * `ModalBackdrop` and its own content stops responding to the mouse (`modal-backdrop.md`).
 */
const DIALOG_CONTENT_STYLE: JSX.CSSProperties = { position: "relative", height: "100%" };

/**
 * Fixed, and well below the dialog's box: the trigger is a DOM child of `Dialog.Content` (which is
 * the point — the popover is nested *inside* the modal) while sitting clear of it on screen, so the
 * card it anchors has empty backdrop underneath rather than dialog.
 */
const POPOVER_TRIGGER_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "300px",
  left: "120px",
  width: "120px",
};

/**
 * Verbatim from `popover.browser.test.tsx` (they are module-local there, not exported). **The
 * browser project loads no compiled Tailwind**, so every recipe class is an inert string: an
 * unstyled positioner is a block `<div>` as wide as the viewport, which makes `flip`'s cross-axis
 * check fire and silently rewrites `data-align`. `TRANSITIONED_CONTENT_STYLE` spells the recipe's
 * own `duration-150` where `getComputedStyle` can read it — `createPresence` reads the computed
 * duration off this element and unmounts immediately when it is `0`.
 *
 * The exit duration is load-bearing *here* in a way it is not there: it is the window in which a
 * popover killed by symptom 4 is still in the DOM to be inspected, which is what keeps the
 * symptom-3 failures below reading `inert` rather than `null`.
 */
const POSITIONER_STYLE: JSX.CSSProperties = { width: "200px" };
const TRANSITIONED_CONTENT_STYLE: JSX.CSSProperties = { transition: "opacity 150ms ease-out" };

/**
 * A point on the `ModalBackdrop` clear of every other box in the tree — below the dialog (0–180),
 * below the popover trigger (300–321) and below the card it anchors. Passed explicitly because the
 * backdrop is `position: fixed; inset: 0`, so its *centre* — where a bare click would land — is
 * wherever the card happens to be.
 */
const BACKDROP_CLICK_POINT = { x: 207, y: 800 };

/** Long enough to outlast the focus yank (measured ~3ms), the dismissal it triggers, and the
 * card's 150ms exit transition. A fixed wait, because the assertions it precedes are negative
 * ("still open") and `vi.waitFor` cannot express those. */
const SETTLE_MS = 300;
const settle = () => new Promise((resolve) => setTimeout(resolve, SETTLE_MS));

/**
 * The canonical nesting: `PopoverDemo`'s shape (`popover.browser.test.tsx`) inside `FullDialog`'s
 * (`dialog.browser.test.tsx`), with **default props on both roots**. No `closeOnFocusOutside`, no
 * `modal={false}`, no consumer `Dialog.Backdrop` — the kernel's `ModalBackdrop` is the outside
 * surface these tests click, and a consumer backdrop would paint above it and intercept that.
 *
 * `Popover.Title` is not decoration: a `role="dialog"` surface with no accessible name is an axe
 * `aria-dialog-name` violation. The inner `<button>` is the popover's first focusable — what
 * autofocus targets, and what a pointerdown *inside* the layer lands on.
 */
const PopoverInDialog: Component = () => (
  <Themed>
    <Dialog.Root>
      <Dialog.Trigger>Open dialog</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Positioner style={DIALOG_POSITIONER_STYLE}>
          <Dialog.Content style={DIALOG_CONTENT_STYLE}>
            <Dialog.Title>Dialog title</Dialog.Title>
            <Dialog.Description>Dialog description</Dialog.Description>
            <Popover.Root>
              <Popover.Trigger style={POPOVER_TRIGGER_STYLE}>Open popover</Popover.Trigger>
              <Popover.Portal>
                <Popover.Positioner style={POSITIONER_STYLE}>
                  <Popover.Content style={TRANSITIONED_CONTENT_STYLE}>
                    <Popover.Title>Popover title</Popover.Title>
                    <Popover.Description>Popover description</Popover.Description>
                    <button type="button" data-testid="popover-inner">
                      inner
                    </button>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover.Root>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  </Themed>
);

/** Both families portal into `document.body`, so every query runs against the document. */
const partOf = (slot: string) => document.querySelector<HTMLElement>(`[data-slot="${slot}"]`);

const modalBackdrop = () => document.querySelector("[data-hope-ui-modal-backdrop]");

/**
 * What a real mouse click at the centre of `element` would actually hit. Copied from
 * `dialog.browser.test.tsx` — a synthetic `element.click()` bypasses hit testing entirely and would
 * happily fire through an `inert` layer, so it cannot answer the question this file asks.
 */
function topmostElementOver(element: Element): Element | null {
  const rect = element.getBoundingClientRect();
  return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

/** Enough of an element to recognise in a failure message, without dumping a whole subtree. */
const describeElement = (element: Element | null) =>
  element === null ? "null" : element.outerHTML.slice(0, 120);

/**
 * `mount()` plus a safety net. Every test still calls `dispose()` itself — that call is the
 * `STRICT_READ_UNTRACKED` / `REACTIVE_WRITE_IN_OWNED_SCOPE` gate (`mount.md`), and it is how this
 * phase *confirms* rather than assumes that the layer registries the ports add are safe for a
 * descendant to register into.
 *
 * The net exists because this file is red by design: a test failing before its own `dispose()`
 * would leave a modal dialog mounted, and `createHideOutside` would then mark the *next* test's
 * container `inert` + `aria-hidden` — turning one honest failure into eight unreadable ones.
 */
function mountLayers(ui: () => JSX.Element): { dispose: () => void } {
  const mounted = mount(ui);
  let disposed = false;
  const dispose = () => {
    if (disposed) {
      return;
    }
    disposed = true;
    mounted.dispose();
  };
  onTestFinished(dispose);
  return { dispose };
}

interface OpenLayers {
  /** Captured before the dialog opens — see {@link openBothLayers}. */
  dialogTrigger: HTMLElement;
  popoverTrigger: HTMLElement;
  dialogContent: HTMLElement;
  popoverPositioner: HTMLElement;
  popoverContent: HTMLElement;
}

/**
 * Opens the dialog, then the popover inside it, and hands back every element the assertions need.
 *
 * The dialog trigger is grabbed **before** the dialog opens: `createHideOutside` puts the mount
 * container (and the trigger with it) inside an `aria-hidden` subtree, so a role locator correctly
 * stops matching it the moment the modal is up. The popover trigger is not affected — it lives
 * inside `Dialog.Content`, which is the layer's spared target.
 */
async function openBothLayers(): Promise<OpenLayers> {
  const dialogTrigger = page.getByRole("button", { name: "Open dialog" }).element() as HTMLElement;
  await userEvent.click(dialogTrigger);

  const dialogContent = await vi.waitFor(() => {
    const element = partOf("dialog-content");
    expect(element, "the dialog never opened").not.toBeNull();
    return element as HTMLElement;
  });

  const popoverTrigger = page
    .getByRole("button", { name: "Open popover" })
    .element() as HTMLElement;
  await userEvent.click(popoverTrigger);

  // The component-layer stand-in for `floating.isPositioned()`: `floatingStyles()` is the
  // `visibility: hidden` pre-positioned branch until the first measurement lands. Every geometry
  // assertion (and axe) must wait for it — before it, they would inspect a layer parked at 0,0.
  const popoverPositioner = await vi.waitFor(() => {
    const element = partOf("popover-positioner");
    expect(element, "the popover never mounted its layer").not.toBeNull();
    expect(element?.style.visibility).not.toBe("hidden");
    expect(element?.style.transform ?? "").toContain("translate(");
    return element as HTMLElement;
  });

  const popoverContent = partOf("popover-content") as HTMLElement;
  expect(popoverContent, "the popover positioner mounted without its card").not.toBeNull();

  return { dialogTrigger, popoverTrigger, dialogContent, popoverPositioner, popoverContent };
}

/**
 * Axe returns `aria-valid-attr-value` as *incomplete* for **any** element carrying both
 * `aria-haspopup` and `aria-controls`, without ever resolving the IDREF — undecidable by
 * construction, not a markup problem. Same allowance, same reason, as
 * `popover.browser.test.tsx`'s.
 */
const AXE_OPTIONS = { allowIncomplete: ["aria-valid-attr-value"] };

describe("Popover inside a modal Dialog — the layer above the modal", () => {
  // ---- symptom 3: the Dialog's MutationObserver marks the Popover inert + aria-hidden ----

  it("leaves the popover layer out of the dialog's hide-outside marking", async () => {
    const { dispose } = mountLayers(() => <PopoverInDialog />);
    const { popoverPositioner } = await openBothLayers();

    // The positioner is the direct `<body>` child the dialog's observer sees added, and sparing it
    // spares its whole subtree — `isSpared` already tests `target.contains(node)`.
    expect(popoverPositioner.hasAttribute("inert"), "the dialog marked the popover inert").toBe(
      false,
    );
    expect(
      popoverPositioner.getAttribute("aria-hidden"),
      "the dialog marked the popover aria-hidden",
    ).toBeNull();

    dispose();
  });

  it("keeps the card hit-testable, not merely visible", async () => {
    const { dispose } = mountLayers(() => <PopoverInDialog />);
    const { popoverContent } = await openBothLayers();

    // The nastiest half of symptom 3, because the card looks perfectly fine: both layers are at
    // `z-50` and the popover's portal is the later body child, so it paints **on top** of the
    // dialog and its scrim, undimmed and legible. `inert` is what makes it transparent to hit
    // testing — so this is the only assertion that can tell the two apart.
    const topmost = topmostElementOver(popoverContent);
    expect(
      popoverContent.contains(topmost),
      `a click at the card's centre would land on ${describeElement(topmost)}`,
    ).toBe(true);

    dispose();
  });

  it("keeps both popups in the accessibility tree", async () => {
    const { dispose } = mountLayers(() => <PopoverInDialog />);
    const { dialogContent, popoverContent } = await openBothLayers();

    // A role locator is the accessibility tree's own view: `aria-hidden` removes an element from
    // it, `inert` (measured, this Chromium) does not. Both surfaces carry `role="dialog"`.
    const dialogs = page.getByRole("dialog").elements();
    expect(dialogs, `role=dialog matched ${dialogs.map(describeElement).join(", ")}`).toHaveLength(
      2,
    );
    expect(dialogs).toContain(dialogContent);
    expect(dialogs).toContain(popoverContent);

    dispose();
  });

  // ---- symptom 4: the Dialog's focus trap yanks focus out, and the Popover dismisses itself ----

  it("moves focus into the popup and stays open with the default closeOnFocusOutside", async () => {
    const { dispose } = mountLayers(() => <PopoverInDialog />);
    const { popoverContent } = await openBothLayers();

    // The sequence symptom 4 names: autofocus moves focus into the portaled popup, the dialog's
    // focus trap sees focus land outside *its* container and pulls it straight back to the dialog's
    // own first focusable, and the popover's focus-out dismissal reads that as focus leaving. The
    // card flashes and is gone — the thing a consumer hits first, and why the story carries
    // `closeOnFocusOutside={false}`.
    //
    // **Focus is the assertion that measures it, not survival.** Measured here, symptom 3 currently
    // *masks* symptom 4: an element inside an `inert` subtree is not focusable, so autofocus's
    // `.focus()` is a silent no-op, no `focusin` fires, the trap never runs and the layer never
    // dismisses itself. Asserting only "still open" would therefore pass today and regress the
    // moment the hide-outside port makes the popup focusable again.
    await settle();

    const inner = page.getByTestId("popover-inner").element() as HTMLElement;
    expect(document.activeElement, `focus is on ${describeElement(document.activeElement)}`).toBe(
      inner,
    );
    expect(partOf("popover-content"), "the popover dismissed itself").not.toBeNull();
    expect(popoverContent.getAttribute("data-presence")).toBe("entered");

    dispose();
  });

  // ---- symptoms 1 + 2: dismissal reaches every layer, and focus goes down with it ----

  it("closes only the popover on Escape, and hands focus back to the popover trigger", async () => {
    const { dispose } = mountLayers(() => <PopoverInDialog />);
    const { popoverTrigger } = await openBothLayers();

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(partOf("popover-content")).toBeNull());

    expect(partOf("dialog-content"), "Escape closed the dialog underneath too").not.toBeNull();
    await vi.waitFor(() =>
      expect(
        document.activeElement,
        `focus landed on ${describeElement(document.activeElement)}`,
      ).toBe(popoverTrigger),
    );

    dispose();
  });

  it("closes the dialog on a second Escape, and hands focus back to the dialog trigger", async () => {
    const { dispose } = mountLayers(() => <PopoverInDialog />);
    const { dialogTrigger, popoverTrigger } = await openBothLayers();

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(partOf("popover-content")).toBeNull());
    await vi.waitFor(() => expect(document.activeElement).toBe(popoverTrigger));

    // Escape walks the chain down one layer at a time, which is only observable once the first
    // Escape has stopped taking both.
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(partOf("dialog-content")).toBeNull());
    await vi.waitFor(() =>
      expect(
        document.activeElement,
        `focus landed on ${describeElement(document.activeElement)}`,
      ).toBe(dialogTrigger),
    );

    dispose();
  });

  it("closes only the popover on an outside pointerdown", async () => {
    const { dispose } = mountLayers(() => <PopoverInDialog />);
    await openBothLayers();

    const backdrop = modalBackdrop();
    expect(backdrop, "a modal dialog always renders the kernel's ModalBackdrop").not.toBeNull();

    await userEvent.click(page.elementLocator(backdrop as Element), {
      position: BACKDROP_CLICK_POINT,
    });

    await vi.waitFor(() => expect(partOf("popover-content")).toBeNull());
    expect(
      partOf("dialog-content"),
      "the same pointerdown closed the dialog underneath too",
    ).not.toBeNull();

    dispose();
  });

  it("leaves the dialog open on a pointerdown inside the popover", async () => {
    const { dispose } = mountLayers(() => <PopoverInDialog />);
    await openBothLayers();

    // **The subject of this test is not measurable today — the interaction it describes is
    // unreachable, so it fails on the precondition below rather than on the assertion.** While the
    // dialog's hide-outside marks the popover `inert`, a real pointer never reaches the card at
    // all: the hit test falls through to the `ModalBackdrop`, which is *outside* the dialog and
    // dismisses it. So the hide-outside port (removing `inert`) is what makes this test
    // *reachable*, and the dismissable port (a target inside a layer **above** this one is not
    // "outside") is what makes it pass — which is exactly why those two cannot ship separately: the
    // first one alone turns a click inside the popover into a click that closes the dialog.
    // The precondition is spelled out rather than left to `userEvent`, which would otherwise fail
    // this on a pointer-actionability timeout that names no cause.
    const inner = page.getByTestId("popover-inner").element() as HTMLElement;
    const topmost = topmostElementOver(inner);
    expect(
      inner.contains(topmost),
      `the popup is unreachable: a click on its inner button would land on ${describeElement(topmost)}`,
    ).toBe(true);

    await userEvent.click(inner);
    await settle();

    expect(partOf("dialog-content"), "a click inside the popover closed the dialog").not.toBeNull();
    expect(partOf("popover-content"), "a click inside the popover closed it").not.toBeNull();

    dispose();
  });

  // ---- the whole nesting, seen by axe ----

  it("has no accessibility violations with both layers open", async () => {
    const { dispose } = mountLayers(() => <PopoverInDialog />);
    const { popoverContent } = await openBothLayers();

    // Guarded rather than assumed: axe over a nesting whose upper layer has already dismissed
    // itself would be checking the single-dialog case this file is not about.
    expect(popoverContent.isConnected, "the popover was gone before axe ran").toBe(true);
    await expectNoA11yViolations(document.body, AXE_OPTIONS);

    dispose();
  });
});
