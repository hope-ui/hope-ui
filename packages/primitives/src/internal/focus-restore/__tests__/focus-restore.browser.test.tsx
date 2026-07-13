import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { type Accessor, createSignal, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { createFocusTrap } from "../../focus-trap/focus-trap";
import { createFocusRestore } from "../focus-restore";

/**
 * `trap` composes `createFocusTrap` on the same `active` signal — the arrangement
 * `Dialog.Popup` uses for a modal dialog, and the one the two ordering constraints in
 * `focus-restore.md` exist for.
 */
function TestHarness(props: { active: Accessor<boolean>; trap?: boolean }) {
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();

  // Created first, so its `document.activeElement` snapshot precedes the trap's `.focus()`.
  createFocusRestore({ active: props.active });
  if (props.trap) createFocusTrap({ active: props.active, ref: containerRef });

  return (
    <div>
      <button type="button" data-testid="outside">
        Outside
      </button>
      <Show when={props.active()}>
        <div data-testid="container" ref={setContainerRef}>
          <button type="button" data-testid="inside">
            Inside
          </button>
        </div>
      </Show>
    </div>
  );
}

/** Clears focus, so a previous test's active element can't leak into this one. */
function blurEverything(): void {
  (document.activeElement as HTMLElement | null)?.blur();
}

describe("createFocusRestore", () => {
  it("restores focus to whatever was focused when it activated", async () => {
    const [active, setActive] = createSignal(false);
    const { dispose } = mount(() => <TestHarness active={active} />);

    page.getByTestId("outside").element().focus();
    setActive(true);
    await expect.element(page.getByTestId("inside")).toBeInTheDocument();

    // Focus moves into the layer, as an overlay's own initial-focus logic would move it.
    (page.getByTestId("inside").element() as HTMLElement).focus();
    await expect.element(page.getByTestId("inside")).toHaveFocus();

    setActive(false);
    await expect.element(page.getByTestId("outside")).toHaveFocus();

    dispose();
  });

  it("restores focus past an active focus trap on the same signal", async () => {
    // The regression this primitive's microtask deferral exists for. Sibling effect
    // cleanups run in *creation* order, so this cleanup fires while the trap's `focusin`
    // listener is still attached. A synchronous `.focus()` here would dispatch `focusin`
    // and the live trap would yank focus straight back into the container — leaving focus
    // on `<body>` once the container unmounts.
    const [active, setActive] = createSignal(false);
    const { dispose } = mount(() => <TestHarness active={active} trap />);

    page.getByTestId("outside").element().focus();
    setActive(true);
    // The trap moved focus in, which is exactly what must not corrupt the snapshot.
    await expect.element(page.getByTestId("inside")).toHaveFocus();

    setActive(false);
    await expect.element(page.getByTestId("outside")).toHaveFocus();

    dispose();
  });

  it("skips restore when the remembered element has left the document", async () => {
    const [active, setActive] = createSignal(false);
    const { dispose } = mount(() => <TestHarness active={active} />);

    const outside = page.getByTestId("outside").element() as HTMLElement;
    outside.focus();
    setActive(true);
    await expect.element(page.getByTestId("inside")).toBeInTheDocument();

    outside.remove();
    setActive(false);
    await vi.waitFor(() => expect(page.getByTestId("inside").query()).toBeNull());

    // No throw, and focus is not forced onto a detached node.
    expect(document.activeElement).not.toBe(outside);

    dispose();
  });

  it("skips restore when nothing meaningful was focused", async () => {
    // `previouslyFocused === document.body` means no element had focus. Restoring it would
    // only blur whatever has focus by the time the layer closes.
    const [active, setActive] = createSignal(false);
    const { dispose } = mount(() => <TestHarness active={active} />);

    blurEverything();
    expect(document.activeElement).toBe(document.body);

    setActive(true);
    await expect.element(page.getByTestId("inside")).toBeInTheDocument();

    const outside = page.getByTestId("outside").element() as HTMLElement;
    outside.focus();
    setActive(false);

    await expect.element(page.getByTestId("inside")).not.toBeInTheDocument();
    await expect.element(page.getByTestId("outside")).toHaveFocus();

    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const [active] = createSignal(true);
    const { container, dispose } = mount(() => <TestHarness active={active} />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
