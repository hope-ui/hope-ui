import ssrFixture from "virtual:hydration-fixture?id=dialog";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Dialog } from "../index";

// `Dialog.CloseTrigger` renders a styled `CloseButton`, so every tree here needs a `<ThemeProvider>`.
// The provider emits no DOM of its own (the preset's values live in CSS). The close button is always
// located by its accessible name, which its default `aria-label` keeps as "Close".
function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

// Real server HTML, rendered in-process by the hydration-fixture bridge from the same `Tree` that
// `dialog.ssr.test.tsx` snapshots — so the hydration input and the client tree cannot diverge. The
// interaction tests below use their own richer `FullDialog` instead; they mount, they don't hydrate.
import { Tree } from "./dialog.ssr-entry";

/**
 * The tree the interaction tests drive. The extra props on Backdrop/Content are safe here: both sit
 * inside `Dialog.Portal`, which renders nothing on the server and nothing at all while closed.
 */
function FullDialog(props: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Themed>
      <Dialog.Root onOpenChange={props.onOpenChange}>
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Dialog.Portal>
          {/* Positioned inline, because there is no Tailwind build in this project to apply the
          recipe's own positioning. A `position: fixed` backdrop paints above a static Content
          regardless of DOM order, which would make the card's own content unclickable. */}
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
 * A dialog with real page content behind it, so pointer-blocking and aria-hiding are observable. The
 * card is pinned to the bottom-right so it never overlaps the background button — otherwise a hit
 * test could not tell "blocked by the modal layer" apart from "covered by the card".
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
 * What a real mouse click at the centre of `element` would actually hit. `element.click()` skips hit
 * testing entirely and fires straight through a backdrop, so it cannot answer that question.
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

    // No `aria-controls` while closed: the content isn't in the DOM, and an id reference that
    // resolves to nothing is invalid per ARIA (axe flags it as `aria-valid-attr-value`).
    expect(trigger.element().hasAttribute("aria-controls")).toBe(false);

    // Grab the raw element *before* opening: once modal, everything outside the dialog is marked
    // `aria-hidden`, so a role-based locator correctly stops matching the trigger.
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
    // The closed state is where the dangling `aria-controls` reference used to live, unnoticed
    // because nothing ever ran axe against it.
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
    // The attribute name is a promise to consumers: their exit-transition CSS selects on it. Every
    // component with an enter/exit animation spells it `data-presence`, never `data-status`.
    const { dispose } = mount(() => <FullDialog />);

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    const dialog = page.getByRole("dialog").element();
    const backdrop = page.getByTestId("backdrop").element();

    // The status goes `entering` first and only reaches `entered` after the browser has painted that
    // frame, which is what makes the CSS transition actually run. Content and Backdrop track their
    // own status independently, so wait for both rather than timing one off the other.
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

    // The close button is the only focusable element inside, so Tab must cycle back to it rather
    // than escaping to the trigger or the backdrop.
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

  it("stays modal when a wrapper forwards an unset `modal` prop", async () => {
    // Regression: Solid's `merge` resolves by key *presence*, so `<Dialog.Root modal={props.modal}>`
    // with `modal` unset passed an explicit `undefined` that beat the default — silently producing a
    // non-modal dialog with no focus containment, no scroll lock and no `aria-modal`.
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
    // Focus moving inside is the observable proof that the modal path ran.
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

  it("restores focus to the trigger on Escape when modal={false}", async () => {
    // Regression: focus restoration used to live in the focus-containment cleanup, which a
    // non-modal dialog never runs — so Escape closed the dialog and stranded keyboard focus on
    // `<body>`. It is now driven by the open state alone, independent of modality.
    const { dispose } = mount(() => <DialogWithBackground modal={false} />);

    const trigger = page.getByRole("button", { name: "Open dialog" });
    await userEvent.click(trigger);
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    // Nothing moves focus here, so put it inside the way tabbing would.
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

    // Focus stays on the trigger rather than jumping into the dialog.
    await expect.element(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
    // The page behind stays in the accessibility tree and in the focus order.
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

  it("hides the page behind from assistive technology and the focus order while modal", async () => {
    const { container, dispose } = mount(() => <DialogWithBackground />);

    await userEvent.click(page.getByRole("button", { name: "Open dialog" }));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    // `aria-modal="true"` alone has known VoiceOver/Safari gaps, so everything outside the dialog is
    // marked twice over: `aria-hidden` for the accessibility tree, and `inert` (which removes an
    // element from the focus order and from hit testing) for input. The dialog stays reachable.
    expect(container.getAttribute("aria-hidden")).toBe("true");
    expect(container.hasAttribute("inert")).toBe(true);
    expect(page.getByRole("dialog").element().getAttribute("aria-hidden")).toBeNull();
    expect(page.getByRole("dialog").element().hasAttribute("inert")).toBe(false);

    // The trigger sits in the hidden subtree, so it leaves the accessibility tree entirely.
    expect(page.getByRole("button", { name: "Open dialog" }).query()).toBeNull();

    // `inert` takes the background out of the focus order, which `aria-hidden` alone never does —
    // which is why neither attribute is sufficient on its own.
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
    // An `inert` element is transparent to hit testing, so the pointer-blocking layer marking
    // itself inert would silently stop blocking, and a consumer's `Dialog.Backdrop` would lose its
    // hover styles and pointer handlers.
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
    // Regression: `Dialog.Backdrop` is optional and `aria-modal` does not stop a mouse, so a modal
    // dialog without one let clicks land on the page behind — the click fires before the focus
    // handler can pull focus back. `Dialog.Portal` now always renders its own blocking layer.
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
    // The blocking layer is `Portal`'s *first* child, so a consumer's `Dialog.Backdrop` paints and
    // hit-tests above it and keeps its hover styles, transitions and pointer handlers. Rendering
    // the blocking layer last would silently swallow all of them.
    //
    // `onPointerDown`, not `onClick`: dismissal listens on a capture-phase `pointerdown`, which
    // unmounts the Backdrop before a `click` is ever dispatched to it.
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

  // A consumer's `preventDefault()` is the documented way to cancel an open or a close.

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
            {/* Positioned, because a modal dialog always renders a `position: fixed` blocking layer
            and a static card paints beneath it. `showCloseButton={false}` so the only Close button
            in the tree is the explicit one under test. */}
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

    // The blocking layer covers the viewport, but the card renders after it and is positioned, so
    // it paints — and hit-tests — above.
    expect(topmostElementOver(close.element())).toBe(close.element());
    await userEvent.click(close);
    expect(page.getByRole("dialog").query()).toBeNull();

    dispose();
  });

  it("keeps a consumer-supplied aria-labelledby when no Dialog.Title is rendered", async () => {
    // Regression: the internal `aria-labelledby` is `undefined` when no Title is mounted, and
    // `merge` let that `undefined` erase the consumer's value — leaving the dialog unnamed. An
    // internal value must fall back to the consumer's, never overwrite it.
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

    // `Content` registers its id with `Root` on mount, before it renders any DOM, so the first
    // `aria-controls` the trigger emits already names the consumer's id even though the trigger
    // renders before the portal. The attribute appears only on open; closed, it would dangle.
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
    // `renderElement` collapses the internal ref and the consumer's into one, so the consumer's
    // must not have replaced it: Escape only closes if the dismiss layer still got the element.
    await userEvent.keyboard("{Escape}");
    expect(page.getByRole("dialog").query()).toBeNull();

    dispose();
  });

  /**
   * A full styled dialog, so every recipe slot is exercised. There is no Tailwind build in this
   * project, so the recipe's positioning classes resolve to nothing; `Content` is positioned inline
   * to keep it — and its corner Close button — above the pointer-blocking layer.
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
    // The auto close button re-scopes CloseButton's own `close-button` marker to this slot, so the
    // generic one must not leak through alongside it.
    expect(document.querySelector('[data-slot="dialog-close-trigger"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="close-button"]')).toBeNull();

    await expectNoA11yViolations(document.body);
    dispose();
  });

  // A part's `class` must be passed *into* its slot function — `ctx.slots.content(props.class)` — so
  // tailwind-merge sees both strings and drops the conflicting recipe utility. Concatenating after
  // the fact (`cx(slots.content(), props.class)`) type-checks fine but ships both `rounded-xl` and
  // `rounded-none`, with the winner decided by stylesheet order. The docs promise the consumer wins.
  it("lets a non-root part's class win the conflict with its recipe slot", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            <Dialog.Positioner>
              <Dialog.Content
                class="rounded-none"
                style={{ position: "fixed", top: "0", left: "0" }}
              >
                <Dialog.Title>Delete project</Dialog.Title>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    const content = document.querySelector('[data-slot="dialog-content"]')?.className ?? "";
    expect(content).toContain("rounded-none");
    expect(content).not.toMatch(/(?:^|\s)rounded-xl(?:\s|$)/);
    // Non-conflicting recipe classes are untouched.
    expect(content).toContain("bg-surface-overlay");
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
    // Give the (suppressed) dismiss path a frame to run before asserting the dialog survived.
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
  // `ssrFixture` is real server HTML: the bridge renders `Tree` through a nested SSR server, and
  // `dialog.ssr.test.tsx` snapshots that same render, so the two agree byte for byte. It cannot be
  // produced here — under the client build `renderToStringAsync` returns `undefined`.
  //
  // Both halves import the *same* `Tree` rather than keeping two copies in sync by hand, because
  // Solid matches server and client nodes by position: inserting anything before `Dialog.Trigger`,
  // even a component that renders nothing, shifts its key and breaks hydration. `hydrateFixture`
  // asserts hydration was silent and reused every server node, so a fallback re-render still fails.
  it("hydrates the server HTML in place, without a mismatch or a second render", () => {
    const { dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    dispose();
  });

  it("leaves the hydrated trigger interactive, and mounts the portal client-side", async () => {
    // The whole point of `Dialog.Portal`'s server guard: portaled content is absent from the server
    // HTML and appears on the client only once the dialog opens.
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
