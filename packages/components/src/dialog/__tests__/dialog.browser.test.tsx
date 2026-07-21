import ssrFixture from "virtual:hydration-fixture?id=dialog";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Dialog } from "../index";

// `Dialog.CloseTrigger` now renders a recipe-styled `CloseButton` (an icon-only X, self-labelled
// `common.close` → accessible name "Close"), so any tree that renders it must sit under a
// `<ThemeProvider>` fed the `hope` preset. It is a zero-DOM provider (its token values live in CSS).
// The Close button is still located by its accessible name — `getByRole("button", { name: "Close" })`
// — which the default `aria-label` keeps stable, so the interaction assertions are unchanged.
function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

// Genuine server output, rendered fresh in-process by the hydration-fixture bridge (no committed
// `.html`). `Tree` is the same tree `dialog.ssr.test.tsx` inline-snapshots and the bridge renders,
// so the hydration input and the client tree cannot structurally diverge. The interaction tests
// below keep their own richer `FullDialog` (testids + positioning) — they `mount()`, they don't hydrate.
import { Tree } from "./dialog.ssr-entry";

/**
 * Structurally identical to `Dialog.ssr.test.tsx`'s `FullDialog`, which produces the fixture
 * the hydration tests below consume. Hydration keys are allocated by walking the component
 * tree, so inserting a component before `Dialog.Trigger` here — even one that renders nothing
 * — shifts the trigger's key and fails hydration.
 *
 * The extra props on `Backdrop`/`Popup` are safe: both live inside `Dialog.Portal`, which
 * renders nothing server-side and nothing at all while closed.
 */
function FullDialog(props: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Themed>
      <Dialog.Root onOpenChange={props.onOpenChange}>
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Dialog.Portal>
          {/* Backdrop/Popup given real positioning/dimensions here so real clicks land where a
          consumer's own CSS would put them in practice — a `position: fixed` backdrop otherwise paints
          above a non-positioned (static) Popup regardless of DOM order, which would make Popup's own
          content unclickable. */}
          <Dialog.Backdrop data-testid="backdrop" style={{ position: "fixed", inset: "0" }} />
          {/* No explicit CloseTrigger — `Content` auto-renders one (showCloseButton defaults true). */}
          <Dialog.Positioner>
            <Dialog.Content style={{ position: "relative" }}>
              <Dialog.Title>Dialog title</Dialog.Title>
              <Dialog.Description>Dialog description</Dialog.Description>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Portal>
      </Dialog.Root>
    </Themed>
  );
}

/**
 * A dialog with real page content behind it, so pointer-blocking and aria-hiding are
 * observable. The popup is pinned to the bottom-right so it never sits over the background
 * button — otherwise a hit test can't distinguish "blocked by `ModalBackdrop`" from
 * "covered by the popup".
 */
function DialogWithBackground(props: { modal?: boolean; onBackgroundClick?: () => void }) {
  return (
    <Themed>
      <p>
        <button type="button" data-testid="background-button" onClick={props.onBackgroundClick}>
          Background button
        </button>
      </p>
      <Dialog.Root modal={props.modal}>
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Positioner>
            <Dialog.Content style={{ position: "fixed", bottom: "0", right: "0" }}>
              <Dialog.Title>Dialog title</Dialog.Title>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Portal>
      </Dialog.Root>
    </Themed>
  );
}

/**
 * What a real mouse click at the centre of `element` would actually hit. A synthetic
 * `element.click()` bypasses hit testing entirely and would happily fire through a backdrop,
 * so it can't answer the question this file needs to ask.
 */
function topmostElementOver(element: Element): Element | null {
  const rect = element.getBoundingClientRect();
  return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

describe("Dialog", () => {
  it("is closed by default and opens when the trigger is clicked", async () => {
    const { dispose } = mount(() => <FullDialog />);

    expect(page.getByRole("dialog").query()).toBeNull();
    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    dispose();
  });

  it("sets aria-haspopup/aria-expanded/aria-controls on the trigger", async () => {
    const { dispose } = mount(() => <FullDialog />);

    const trigger = page.getByRole("button", { name: "Open dialog" });
    await expect.element(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");

    // No `aria-controls` while closed: `Popup` isn't in the DOM, and an IDREF that resolves
    // to nothing is an invalid attribute value per ARIA (axe: `aria-valid-attr-value`).
    expect(trigger.element().hasAttribute("aria-controls")).toBe(false);

    // Grab the raw element *before* opening. Once a modal dialog is open,
    // `createHideOutside` puts the trigger inside an `aria-hidden` subtree, so a
    // role-based locator correctly stops matching it — it's no longer in the a11y tree.
    const triggerElement = trigger.element();
    await userEvent.click(trigger);

    expect(triggerElement.getAttribute("aria-expanded")).toBe("true");
    const controls = triggerElement.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    await expect.element(page.getByRole("dialog")).toHaveAttribute("id", controls as string);

    dispose();
  });

  it("drops aria-controls again once the dialog closes", async () => {
    const { dispose } = mount(() => <FullDialog />);

    const trigger = page.getByRole("button", { name: "Open dialog" });
    const triggerElement = trigger.element();
    await userEvent.click(trigger);
    expect(triggerElement.hasAttribute("aria-controls")).toBe(true);

    await userEvent.keyboard("{Escape}");
    await expect.element(trigger).toBeInTheDocument();
    expect(triggerElement.hasAttribute("aria-controls")).toBe(false);

    dispose();
  });

  it("has no baseline accessibility violations while closed", async () => {
    // The closed state is where the dangling `aria-controls` IDREF used to live, and nothing
    // ever ran axe against it.
    const { dispose } = mount(() => <FullDialog />);
    await expect.element(page.getByRole("button", { name: "Open dialog" })).toBeInTheDocument();
    await expectNoA11yViolations(document.body);
    dispose();
  });

  it("links the popup to its Title and Description via aria-labelledby/aria-describedby", async () => {
    const { dispose } = mount(() => <FullDialog />);

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    const dialog = page.getByRole("dialog");
    await expect.element(dialog).toHaveAttribute("aria-modal", "true");

    const labelledBy = dialog.element().getAttribute("aria-labelledby");
    const describedBy = dialog.element().getAttribute("aria-describedby");
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)?.textContent).toBe("Dialog title");
    expect(document.getElementById(describedBy as string)?.textContent).toBe("Dialog description");

    dispose();
  });

  it("exposes createPresence's status as `data-presence` on Popup and Backdrop", async () => {
    // The house convention for every component composing `createPresence` — a consumer's
    // exit-transition CSS keys off it. Not `data-status`: see create-presence.md.
    const { dispose } = mount(() => <FullDialog />);

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    const dialog = page.getByRole("dialog").element();
    const backdrop = page.getByTestId("backdrop").element();

    // `entering` first, then `entered` once the browser has painted the entering frame (a double
    // rAF — see create-presence.md), which is what makes the enter CSS transition actually fire.
    // Popup and Backdrop are *independent* `createPresence` instances, so their flips to `entered`
    // aren't guaranteed to land in the same tick — wait for both rather than asserting one off the
    // other's timing.
    await vi.waitFor(() => {
      expect(dialog.getAttribute("data-presence")).toBe("entered");
      expect(backdrop.getAttribute("data-presence")).toBe("entered");
    });

    dispose();
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    const { dispose } = mount(() => <FullDialog />);

    const trigger = page.getByRole("button", { name: "Open dialog" });
    await userEvent.click(trigger);
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    await expect.element(trigger).toHaveFocus();
    expect(page.getByRole("dialog").query()).toBeNull();

    dispose();
  });

  it("closes when the backdrop (outside the popup) is clicked", async () => {
    const { dispose } = mount(() => <FullDialog />);

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    await userEvent.click(page.getByTestId("backdrop"));
    expect(page.getByRole("dialog").query()).toBeNull();

    dispose();
  });

  it("closes when Dialog.CloseTrigger is clicked", async () => {
    const { dispose } = mount(() => <FullDialog />);

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await userEvent.click(page.getByRole("button", { name: "Close" }));
    expect(page.getByRole("dialog").query()).toBeNull();

    dispose();
  });

  it("traps focus within the popup while open", async () => {
    const { dispose } = mount(() => <FullDialog />);

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expect.element(page.getByRole("button", { name: "Close" })).toHaveFocus();

    // Only the Close button is focusable inside the popup, so Tab should cycle back
    // to it rather than escaping to the trigger or backdrop.
    await userEvent.keyboard("{Tab}");
    await expect.element(page.getByRole("button", { name: "Close" })).toHaveFocus();

    dispose();
  });

  it("calls onOpenChange with the new open state", async () => {
    const onOpenChange = vi.fn();
    const { dispose } = mount(() => <FullDialog onOpenChange={onOpenChange} />);

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    dispose();
  });

  it("supports controlled open state", async () => {
    const [open, setOpen] = createSignal(false);
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root open={open()} onOpenChange={setOpen}>
          <Dialog.Trigger>Open dialog</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Title>Title</Dialog.Title>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));

    expect(page.getByRole("dialog").query()).toBeNull();
    setOpen(true);
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    dispose();
  });

  it("has no baseline accessibility violations while open", async () => {
    const { container, dispose } = mount(() => <FullDialog />);
    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expectNoA11yViolations(document.body);
    dispose();
    void container;
  });

  // ---- prop precedence: internal values must never silently discard the consumer's ----

  it("stays modal when a wrapper forwards an unset `modal` prop", async () => {
    // Regression: `merge({ modal: true }, props)` resolves by key *presence*, so
    // `<Dialog.Root modal={props.modal}>` with `modal` unset silently produced a
    // non-modal dialog — no focus trap, no scroll lock, no aria-modal.
    function Wrapper(props: { modal?: boolean }) {
      return (
        <Themed>
          <Dialog.Root modal={props.modal}>
            <Dialog.Trigger>Open dialog</Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Title>Title</Dialog.Title>
                </Dialog.Content>
              </Dialog.Positioner>
            </Dialog.Portal>
          </Dialog.Root>
        </Themed>
      );
    }

    const { dispose } = mount(() => <Wrapper />);
    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));

    await expect.element(page.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    // Modal implies the focus trap ran: focus moved into the popup.
    await expect.element(page.getByRole("button", { name: "Close" })).toHaveFocus();

    dispose();
  });

  it("still lets an explicit `modal={false}` through", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root modal={false}>
          <Dialog.Trigger>Open dialog</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Title>Title</Dialog.Title>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    expect(page.getByRole("dialog").element().hasAttribute("aria-modal")).toBe(false);

    dispose();
  });

  // ---- `modal={false}`: dismissable and focus-restoring, but never inert ----

  it("restores focus to the trigger on Escape when modal={false}", async () => {
    // The finding-5 regression. Focus restore used to live inside `createFocusTrap`'s
    // cleanup, and a non-modal dialog never activates the trap — so Escape closed the
    // dialog and stranded keyboard focus on `<body>`, in violation of the APG pattern
    // `Dialog.md`'s keyboard table promises. Restore is now `createFocusRestore`, gated on
    // `open()` alone.
    const { dispose } = mount(() => <DialogWithBackground modal={false} />);

    const trigger = page.getByRole("button", { name: "Open dialog" });
    await userEvent.click(trigger);
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    // Nothing traps focus here, so move it into the popup the way tabbing would.
    const close = page.getByRole("button", { name: "Close" });
    (close.element() as HTMLElement).focus();
    await expect.element(close).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    expect(page.getByRole("dialog").query()).toBeNull();
    await expect.element(trigger).toHaveFocus();

    dispose();
  });

  it("does not trap focus, lock scroll, or hide the page when modal={false}", async () => {
    const { container, dispose } = mount(() => <DialogWithBackground modal={false} />);

    const trigger = page.getByRole("button", { name: "Open dialog" });
    await userEvent.click(trigger);
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    // No trap: focus stays on the trigger rather than jumping into the popup.
    await expect.element(trigger).toHaveFocus();
    // No scroll lock.
    expect(document.body.style.overflow).toBe("");
    // No hide-outside: the page behind stays in the accessibility tree and the focus order.
    expect(container.getAttribute("aria-hidden")).toBeNull();
    expect(container.hasAttribute("inert")).toBe(false);

    dispose();
  });

  it("leaves the page behind clickable when modal={false}", async () => {
    const onBackgroundClick = vi.fn();
    const { dispose } = mount(() => (
      <DialogWithBackground modal={false} onBackgroundClick={onBackgroundClick} />
    ));

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    const background = page.getByTestId("background-button");
    expect(topmostElementOver(background.element())).toBe(background.element());

    await userEvent.click(background);
    expect(onBackgroundClick).toHaveBeenCalledOnce();

    dispose();
  });

  // ---- `modal` (the default): the page behind is inert to pointer and to AT ----

  it("hides the page behind from assistive technology and the focus order while modal", async () => {
    const { container, dispose } = mount(() => <DialogWithBackground />);

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    // `aria-modal="true"` alone has known VoiceOver/Safari gaps, so `createHideOutside` marks
    // everything outside the popup: `aria-hidden` for the accessibility tree, `inert` for the
    // focus order and hit testing. The popup itself stays reachable.
    expect(container.getAttribute("aria-hidden")).toBe("true");
    expect(container.hasAttribute("inert")).toBe(true);
    expect(page.getByRole("dialog").element().getAttribute("aria-hidden")).toBeNull();
    expect(page.getByRole("dialog").element().hasAttribute("inert")).toBe(false);

    // The trigger is inside the hidden subtree, so it leaves the accessibility tree entirely.
    expect(page.getByRole("button", { name: "Open dialog" }).query()).toBeNull();

    // And `inert` takes the background out of the focus order, which `aria-hidden` never does.
    const background = page.getByTestId("background-button").element() as HTMLElement;
    background.focus();
    expect(document.activeElement).not.toBe(background);

    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("button", { name: "Open dialog" })).toBeInTheDocument();
    expect(container.getAttribute("aria-hidden")).toBeNull();
    expect(container.hasAttribute("inert")).toBe(false);

    dispose();
  });

  it("spares both backdrops from `inert`, so they keep working", async () => {
    // An `inert` element is transparent to hit testing. A `ModalBackdrop` that hid itself
    // would silently stop blocking the pointer, and a consumer's `Dialog.Backdrop` would lose
    // its hover styles and pointer handlers.
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            <Dialog.Backdrop data-testid="backdrop" style={{ position: "fixed", inset: "0" }} />
            <Dialog.Positioner>
              <Dialog.Content style={{ position: "fixed", bottom: "0", right: "0" }}>
                <Dialog.Title>Title</Dialog.Title>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));

    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    const modalBackdrop = document.querySelector("[data-hope-ui-modal-backdrop]");
    expect(modalBackdrop?.hasAttribute("inert")).toBe(false);
    expect(page.getByTestId("backdrop").element().hasAttribute("inert")).toBe(false);

    dispose();
  });

  it("blocks the pointer from reaching the page behind a modal dialog, with no Backdrop", async () => {
    // The finding-6 regression. `Dialog.Backdrop` is optional and `aria-modal` doesn't stop
    // a mouse, so a modal dialog with no Backdrop let a click land on a background button —
    // the click fires before `createFocusTrap`'s `focusin` handler can yank focus back.
    // `Dialog.Portal` now always renders the kernel's `ModalBackdrop` when modal.
    const onBackgroundClick = vi.fn();
    const { dispose } = mount(() => <DialogWithBackground onBackgroundClick={onBackgroundClick} />);

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    const background = page.getByTestId("background-button").element();
    const topmost = topmostElementOver(background);

    expect(topmost).not.toBe(background);
    expect((topmost as Element).hasAttribute("data-hope-ui-modal-backdrop")).toBe(true);
    expect(onBackgroundClick).not.toHaveBeenCalled();

    dispose();
  });

  it("keeps a consumer Backdrop hit-testable above the internal one", async () => {
    // `ModalBackdrop` is `Portal`'s *first* child, so a consumer's optional `Dialog.Backdrop`
    // still paints and hit-tests above it — its hover styles, transitions and pointer handlers
    // all keep working. Rendering it inside `Popup` (where Base UI puts theirs) would cover
    // the consumer's and silently swallow them.
    //
    // `onPointerDown`, not `onClick`: `createDismissable` closes the dialog on a capture-phase
    // `pointerdown`, which unmounts the Backdrop before `click` is ever dispatched. That's
    // true with or without a `ModalBackdrop` — see Dialog.md.
    const onBackdropPointerDown = vi.fn();
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root>
          <Dialog.Trigger>Open dialog</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop
              data-testid="backdrop"
              onPointerDown={onBackdropPointerDown}
              style={{ position: "fixed", inset: "0" }}
            />
            <Dialog.Positioner>
              <Dialog.Content style={{ position: "fixed", bottom: "0", right: "0" }}>
                <Dialog.Title>Title</Dialog.Title>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    const backdrop = page.getByTestId("backdrop").element();
    expect(topmostElementOver(backdrop)).toBe(backdrop);

    await userEvent.click(page.getByTestId("backdrop"));
    expect(onBackdropPointerDown).toHaveBeenCalledOnce();
    expect(page.getByRole("dialog").query()).toBeNull();

    dispose();
  });

  it("restores body scroll after a modal dialog closes", async () => {
    const { dispose } = mount(() => <DialogWithBackground />);

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("button", { name: "Open dialog" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");

    dispose();
  });

  // ---- composeEventHandlers: `preventDefault()` is the consumer's cancel channel ----

  it("lets a consumer's onClick cancel the open with preventDefault", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root>
          <Dialog.Trigger onClick={(event) => event.preventDefault()}>Open dialog</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Title>Title</Dialog.Title>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    expect(page.getByRole("dialog").query()).toBeNull();

    dispose();
  });

  it("runs a consumer's onClick before opening, and still opens without preventDefault", async () => {
    const order: string[] = [];
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root onOpenChange={() => order.push("open")}>
          <Dialog.Trigger onClick={() => order.push("consumer")}>Open dialog</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Title>Title</Dialog.Title>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    expect(order).toEqual(["consumer", "open"]);

    dispose();
  });

  it("lets a consumer's onClick cancel the close with preventDefault", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            {/* Positioned, because a modal dialog always renders a `position: fixed`
            `ModalBackdrop` and a `position: static` popup paints beneath it. See Dialog.md.
            `showCloseButton={false}` so the only Close button is the explicit one under test. */}
            <Dialog.Positioner>
              <Dialog.Content showCloseButton={false} style={{ position: "fixed" }}>
                <Dialog.Title>Title</Dialog.Title>
                <Dialog.CloseTrigger onClick={(event) => event.preventDefault()} />
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));

    await userEvent.click(page.getByRole("button", { name: "Close" }));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    dispose();
  });

  it("keeps a positioned modal Popup's own content clickable above the ModalBackdrop", async () => {
    const { dispose } = mount(() => <DialogWithBackground />);

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    const close = page.getByRole("button", { name: "Close" });
    await expect.element(close).toBeInTheDocument();

    // `ModalBackdrop` covers the viewport, but the popup renders after it and is positioned,
    // so it paints (and hit-tests) above.
    expect(topmostElementOver(close.element())).toBe(close.element());
    await userEvent.click(close);
    expect(page.getByRole("dialog").query()).toBeNull();

    dispose();
  });

  it("keeps a consumer-supplied aria-labelledby when no Dialog.Title is rendered", async () => {
    // Regression: `aria-labelledby` came from `context.titleId()`, which is `undefined`
    // with no Title mounted — and `merge` let that `undefined` erase the consumer's value,
    // leaving the dialog with no accessible name at all.
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root>
          <h2 id="external-heading">Heading outside the popup</h2>
          <Dialog.Trigger>Open dialog</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Positioner>
              <Dialog.Content aria-labelledby="external-heading" />
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expect
      .element(page.getByRole("dialog"))
      .toHaveAttribute("aria-labelledby", "external-heading");

    dispose();
  });

  it("lets a consumer-supplied aria-labelledby win over Dialog.Title", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root>
          <h2 id="external-heading">Outside</h2>
          <Dialog.Trigger>Open dialog</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Positioner>
              <Dialog.Content aria-labelledby="external-heading">
                <Dialog.Title>Inner title</Dialog.Title>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expect
      .element(page.getByRole("dialog"))
      .toHaveAttribute("aria-labelledby", "external-heading");

    dispose();
  });

  it("supports role='alertdialog' (the APG alert dialog pattern)", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root role="alertdialog">
          <Dialog.Trigger>Delete everything</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Title>Are you sure?</Dialog.Title>
                <Dialog.Description>This cannot be undone.</Dialog.Description>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));

    await userEvent.click(page.getByRole("button", { name: "Delete everything" }));
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();
    expect(page.getByRole("dialog").query()).toBeNull();

    dispose();
  });

  it("lets the consumer pin the popup's id, and points aria-controls at it", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root>
          <Dialog.Trigger>Open dialog</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Positioner>
              <Dialog.Content id="my-popup">
                <Dialog.Title>Title</Dialog.Title>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));

    const trigger = page.getByRole("button", { name: "Open dialog" });
    const triggerElement = trigger.element();

    // `Popup` registers its id with `Root` on mount — before it ever renders a DOM node — so
    // the very first `aria-controls` the trigger emits already names the consumer's id, even
    // though the trigger renders before the portal. (The attribute itself only appears on
    // open; while closed it would be a dangling IDREF.)
    await userEvent.click(trigger);
    expect(triggerElement.getAttribute("aria-controls")).toBe("my-popup");
    await expect.element(page.getByRole("dialog")).toHaveAttribute("id", "my-popup");

    dispose();
  });

  it("merges a consumer `ref` on Popup with the internal one", async () => {
    let consumerRef: HTMLElement | undefined;
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            <Dialog.Positioner>
              <Dialog.Content ref={(el: HTMLDivElement) => (consumerRef = el)}>
                <Dialog.Title>Title</Dialog.Title>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));

    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    expect(consumerRef).toBe(page.getByRole("dialog").element());
    // The internal ref still works: Escape only closes if createDismissable got the element.
    await userEvent.keyboard("{Escape}");
    expect(page.getByRole("dialog").query()).toBeNull();

    dispose();
  });

  // ---- styled layer: recipe slots, showCloseButton, dismissal toggles (from Root) ----

  /**
   * A full styled dialog with the structural parts, so the recipe slots are all exercised. The
   * recipe's positioning classes have no CSS in the test environment (there is no Tailwind here — the
   * other tests position inline for the same reason), so `Content` is positioned inline to keep it —
   * and its corner Close button — above the pointer-blocking `ModalBackdrop`.
   */
  function StyledDialog(props: { showCloseButton?: boolean }) {
    return (
      <Themed>
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            <Dialog.Backdrop data-testid="backdrop" style={{ position: "fixed", inset: "0" }} />
            <Dialog.Positioner>
              <Dialog.Content
                showCloseButton={props.showCloseButton}
                style={{ position: "fixed", top: "0", left: "0" }}
              >
                <Dialog.Header>
                  <Dialog.Title>Delete project</Dialog.Title>
                  <Dialog.Description>This cannot be undone.</Dialog.Description>
                </Dialog.Header>
                <Dialog.Body>Body content</Dialog.Body>
                <Dialog.Footer>Footer content</Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    );
  }

  it("marks each styled part with its data-slot, and has no a11y violations", async () => {
    const { dispose } = mount(() => <StyledDialog />);
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    // The parts portal to `document.body`, so query the whole document, not the mount container.
    for (const slot of [
      "dialog-backdrop",
      "dialog-positioner",
      "dialog-content",
      "dialog-header",
      "dialog-body",
      "dialog-footer",
      "dialog-title",
      "dialog-description",
    ]) {
      expect(document.querySelector(`[data-slot="${slot}"]`)).toBeTruthy();
    }
    // The auto CloseTrigger renders a `CloseButton` re-scoped to the `dialog-close-trigger` slot.
    expect(document.querySelector('[data-slot="dialog-close-trigger"]')).toBeTruthy();
    // …and no longer leaks CloseButton's generic root marker.
    expect(document.querySelector('[data-slot="close-button"]')).toBeNull();

    await expectNoA11yViolations(document.body);
    dispose();
  });

  it("auto-renders a corner CloseTrigger by default, which closes the dialog", async () => {
    const { dispose } = mount(() => <StyledDialog />);
    const close = page.getByRole("button", { name: "Close" });
    await expect.element(close).toBeInTheDocument();

    await userEvent.click(close);
    expect(page.getByRole("dialog").query()).toBeNull();
    dispose();
  });

  it("omits the auto CloseTrigger when showCloseButton={false}", async () => {
    const { dispose } = mount(() => <StyledDialog showCloseButton={false} />);
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    expect(page.getByRole("button", { name: "Close" }).query()).toBeNull();
    dispose();
  });

  it("does not close on Escape when Root sets closeOnEscape={false}", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root defaultOpen closeOnEscape={false}>
          <Dialog.Portal>
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Title>Title</Dialog.Title>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    // A frame for the (suppressed) dismiss path before asserting the dialog survived.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    dispose();
  });

  it("does not close on an outside pointerdown when Root sets closeOnInteractOutside={false}", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root defaultOpen closeOnInteractOutside={false}>
          <Dialog.Portal>
            <Dialog.Backdrop data-testid="backdrop" style={{ position: "fixed", inset: "0" }} />
            <Dialog.Positioner>
              <Dialog.Content style={{ position: "fixed", bottom: "0", right: "0" }}>
                <Dialog.Title>Title</Dialog.Title>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    await userEvent.click(page.getByTestId("backdrop"));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    dispose();
  });
});

describe("Dialog hydration", () => {
  // `ssrFixture` is genuine server output: the hydration-fixture bridge renders `Tree` through a
  // nested SSR server and `dialog.ssr.test.tsx` inline-snapshots that same render, so they agree
  // byte-for-byte. Rendering it here would be worthless — the client build's `renderToStringAsync`
  // returns `undefined`. Reusing `Tree` (rather than a hand-kept-identical copy) keeps the client
  // tree structurally identical to the server's: hydration keys are a path through the tree, so
  // inserting anything before `Dialog.Trigger` — even a component that renders nothing — would shift
  // the trigger's key. `hydrateFixture` proves hydration was silent and reused every server node.
  it("hydrates the server HTML in place, without a mismatch or a second render", () => {
    const { dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    dispose();
  });

  it("leaves the hydrated trigger interactive, and mounts the portal client-side", async () => {
    // The whole point of `Dialog.Portal`'s `isServer` guard: portaled content is absent from
    // the SSR HTML, and appears on the client only once the dialog opens.
    const { dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    expect(page.getByRole("dialog").query()).toBeNull();

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
