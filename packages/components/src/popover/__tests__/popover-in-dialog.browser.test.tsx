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
 * **A Popover opened inside a modal Dialog.** A modal Dialog defends itself against everything
 * outside its own content: it marks that content's siblings `inert` + `aria-hidden`, cages focus
 * inside itself, and listens for Escape on the document. A `Popover.Portal` mounts its layer as a
 * *sibling* of the dialog's — so by every DOM measure the popup is "outside", and all three defences
 * fire on it.
 *
 * This file was written red, one assertion per symptom, and each test below still names the one it
 * guards. The four symptoms, each fixed by a different document-wide layer registry:
 *
 * 1. **Escape and outside-pointerdown reached every open layer at once**, closing both. Fixed by
 *    letting only the topmost layer consume a dismissal.
 * 2. **Focus went down with it** — two focus restores fired for triggers that were both unmounting,
 *    so the popover's trigger (the control the reader actually pressed) never got focus back. Fixed
 *    by the same gate: one Escape now closes one layer, so each restore has a live trigger.
 * 3. **The Dialog marked the Popover `inert` + `aria-hidden`.** `inert` makes an element transparent
 *    to hit testing while changing nothing about how it paints, so the card still looked perfectly
 *    normal on top of the dialog and no click reached a word of it. Fixed by letting an inner layer
 *    register itself as spared.
 * 4. **The Dialog's focus trap yanked focus back out of the Popover**, which read the yank as focus
 *    leaving and dismissed itself — the popup flashed and was gone in ~3ms. Fixed by a focus-scope
 *    stack: focus in a layer opened *above* a trap is not focus escaping it. **Both roots here carry
 *    default props**, which is what keeps this symptom reachable at all.
 *
 * Symptom 3 *masked* symptom 4 while both were live: an element inside an `inert` subtree is not
 * focusable, so autofocus was a silent no-op and the trap never ran. Hence the tests below assert on
 * **focus** rather than on survival.
 *
 * Two measured facts the assertions rest on: this test project compiles no Tailwind and its viewport
 * is 414×896, so every recipe class is inert and both layers need an inline box; and a programmatic
 * `.click()` fires no pointerdown and no focus, so every interaction goes through `userEvent`.
 */

// Both families read a theme recipe, so every tree here needs a provider. It renders no DOM of its
// own (hope's token values live in CSS), so it changes nothing these assertions look at.
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
 * Positioned, because a modal popup must be: an unpositioned one paints *beneath* the modal backdrop,
 * and its own content then stops responding to the mouse.
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
 * Verbatim from `popover.browser.test.tsx`, where they are module-local. No Tailwind is compiled
 * here, so an unstyled positioner is a block `<div>` as wide as the viewport, which makes
 * floating-ui's `flip` fire on the cross axis and rewrite `data-align`.
 * `TRANSITIONED_CONTENT_STYLE` spells the recipe's own exit duration where `getComputedStyle` can
 * read it — the animation state unmounts immediately when that duration is `0`.
 *
 * That duration is load-bearing *here* in a way it is not there: it is the window in which a popover
 * killed by symptom 4 is still in the DOM to be inspected, which keeps the symptom-3 failures below
 * reporting `inert` rather than `null`.
 */
const POSITIONER_STYLE: JSX.CSSProperties = { width: "200px" };
const TRANSITIONED_CONTENT_STYLE: JSX.CSSProperties = { transition: "opacity 150ms ease-out" };

/**
 * A point on the modal backdrop clear of every other box in the tree — below the dialog (0–180),
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
 * The canonical nesting, with **default props on both roots**. No `closeOnFocusOutside`, no
 * `modal={false}`, and no consumer `Dialog.Backdrop`: the built-in modal backdrop is the "outside"
 * surface these tests click, and a consumer backdrop would paint above it and intercept that.
 *
 * `Popover.Title` is not decoration — a `role="dialog"` surface with no accessible name fails the
 * axe check below. The inner `<button>` is the popover's first focusable: what autofocus targets, and
 * what a pointerdown *inside* the layer lands on.
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
 * What a real mouse click at the centre of `element` would actually hit. A synthetic `element.click()`
 * bypasses hit testing entirely and fires happily through an `inert` layer, so it cannot answer the
 * question this file asks.
 */
function topmostElementOver(element: Element): Element | null {
  const rect = element.getBoundingClientRect();
  return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

/** Enough of an element to recognise in a failure message, without dumping a whole subtree. */
const describeElement = (element: Element | null) =>
  element === null ? "null" : element.outerHTML.slice(0, 120);

/**
 * `mount()` plus a safety net. Every test still calls `dispose()` itself, because that call is what
 * fails the test on a Solid reactivity violation — an untracked read, or a descendant writing an
 * ancestor-owned signal — which is how this file confirms rather than assumes that the layer
 * registries are safe for a descendant to register into.
 *
 * The net matters on the day one of these goes red: a test failing before its own `dispose()` leaves
 * a modal dialog mounted, which then marks the *next* test's container `inert` + `aria-hidden` —
 * turning one honest failure into eight unreadable ones.
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
 * The dialog trigger is grabbed **before** the dialog opens: the modal puts the mount container (and
 * the trigger with it) inside an `aria-hidden` subtree, so a role locator correctly stops matching it
 * the moment the modal is up. The popover trigger is unaffected — it lives inside `Dialog.Content`,
 * the one subtree the modal spares.
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

  // Until the first measurement lands the layer is parked at 0,0 under `visibility: hidden`, so
  // every geometry assertion (and axe) has to wait for it.
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
 * Axe reports `aria-valid-attr-value` as *incomplete* for **any** element carrying both
 * `aria-haspopup` and `aria-controls`, bailing out before it resolves the id reference — undecidable
 * by construction, not a markup problem. Same allowance, same reason, as `popover.browser.test.tsx`.
 */
const AXE_OPTIONS = { allowIncomplete: ["aria-valid-attr-value"] };

describe("Popover inside a modal Dialog — the layer above the modal", () => {
  // ---- symptom 3: the Dialog's MutationObserver marks the Popover inert + aria-hidden ----

  it("leaves the popover layer out of the dialog's hide-outside marking", async () => {
    const { dispose } = mountLayers(() => <PopoverInDialog />);
    const { popoverPositioner } = await openBothLayers();

    // The positioner is the direct `<body>` child the dialog's observer sees appear, and sparing an
    // element spares its whole subtree.
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

    // The nastiest half of symptom 3, because the card looks perfectly fine: both layers share a
    // `z-index` and the popover's portal is the later body child, so it paints **on top** of the
    // dialog and its scrim, undimmed and legible. Only `inert`'s effect on hit testing distinguishes
    // a working card from an untouchable one.
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

    // A role locator queries the accessibility tree: `aria-hidden` removes an element from it,
    // `inert` (measured, this Chromium) does not. Both surfaces carry `role="dialog"`.
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

    // Symptom 4's sequence: autofocus moves focus into the portaled popup, the dialog's focus trap
    // sees focus land outside *its* container and pulls it back to the dialog's first focusable, and
    // the popover reads that as focus leaving and dismisses itself. The card flashes and is gone.
    //
    // **Focus is what measures this, not survival.** While symptom 3 was live it *masked* symptom 4:
    // an element inside an `inert` subtree is not focusable, so autofocus was a silent no-op, no
    // `focusin` fired, the trap never ran and nothing dismissed. Asserting only "still open" would
    // have passed with symptom 4 fully present, and would go quiet again the day the popup gets
    // re-hidden by a regression in the marking.
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

    // **This test needs two of the fixes at once, which is why they could not ship separately.**
    // While the popover was marked `inert`, a real pointer never reached the card: the hit test fell
    // through to the backdrop, which *is* outside the dialog and dismisses it. Sparing the popover
    // from the marking makes this interaction **reachable**; treating a target inside a layer *above*
    // the dialog as not-outside makes it **pass**.
    //
    // The precondition is asserted rather than left to `userEvent`, which would otherwise fail on a
    // pointer-actionability timeout that names no cause.
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
