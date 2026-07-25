import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { type Accessor, createSignal, Show } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { createAutoFocus } from "../create-auto-focus";
import { createFocusTrap } from "../create-focus-trap";

/**
 * The container is always mounted, so the `tabindex` it may be given on activation is still
 * inspectable after deactivation.
 */
function TestHarness(props: {
  active: Accessor<boolean>;
  /** Renders no focusable descendant, forcing the container fallback. */
  empty?: boolean;
  /** A `tabindex` the consumer put there, which this primitive must leave alone. */
  containerTabIndex?: string;
  /** Points `initialFocus` at the second button instead of letting the scan pick the first. */
  initialFocusSecond?: boolean;
  /** Points `initialFocus` at a button *outside* the container. */
  initialFocusOutside?: boolean;
}) {
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const [secondRef, setSecondRef] = createSignal<HTMLButtonElement>();
  const [outsideRef, setOutsideRef] = createSignal<HTMLButtonElement>();

  const initialFocus = props.initialFocusSecond
    ? secondRef
    : props.initialFocusOutside
      ? outsideRef
      : undefined;

  createAutoFocus({ active: props.active, ref: containerRef, initialFocus });

  return (
    <div>
      <button type="button" data-testid="outside" ref={setOutsideRef}>
        Outside
      </button>
      <div data-testid="container" ref={setContainerRef} tabindex={props.containerTabIndex}>
        <Show when={!props.empty} fallback={<p>Nothing focusable here</p>}>
          <button type="button" data-testid="first">
            First
          </button>
          <button type="button" data-testid="second" ref={setSecondRef}>
            Second
          </button>
        </Show>
      </div>
    </div>
  );
}

/** The container only exists as a reactive consequence of `active`, so its ref arrives late. */
function LateRefHarness(props: { active: Accessor<boolean> }) {
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();

  createAutoFocus({ active: props.active, ref: containerRef });

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

describe("createAutoFocus", () => {
  it("focuses the first focusable descendant on activation", async () => {
    const [active, setActive] = createSignal(false);
    const { dispose } = mount(() => <TestHarness active={active} />);

    blurEverything();
    setActive(true);
    await expect.element(page.getByTestId("first")).toHaveFocus();

    dispose();
  });

  it("focuses `initialFocus` in preference to the first focusable descendant", async () => {
    const [active, setActive] = createSignal(false);
    const { dispose } = mount(() => <TestHarness active={active} initialFocusSecond />);

    blurEverything();
    setActive(true);
    await expect.element(page.getByTestId("second")).toHaveFocus();

    dispose();
  });

  it("focuses a container with no focusable descendant, under a `tabindex` it adds itself", async () => {
    const [active, setActive] = createSignal(false);
    const { dispose } = mount(() => <TestHarness active={active} empty />);

    blurEverything();
    setActive(true);
    await expect.element(page.getByTestId("container")).toHaveAttribute("tabindex", "-1");
    await expect.element(page.getByTestId("container")).toHaveFocus();

    dispose();
  });

  it("removes the `tabindex` it added on deactivation", async () => {
    const [active, setActive] = createSignal(false);
    const { dispose } = mount(() => <TestHarness active={active} empty />);

    blurEverything();
    setActive(true);
    await expect.element(page.getByTestId("container")).toHaveAttribute("tabindex", "-1");

    setActive(false);
    await expect.element(page.getByTestId("container")).not.toHaveAttribute("tabindex");

    dispose();
  });

  it("leaves a `tabindex` the consumer put there alone", async () => {
    const [active, setActive] = createSignal(false);
    const { dispose } = mount(() => <TestHarness active={active} empty containerTabIndex="-1" />);

    blurEverything();
    setActive(true);
    await expect.element(page.getByTestId("container")).toHaveFocus();

    setActive(false);
    // Still there: this primitive removes only what it added.
    await expect.element(page.getByTestId("container")).toHaveAttribute("tabindex", "-1");

    dispose();
  });

  it("focuses a ref that only arrives after `active` flipped", async () => {
    // The reason the effect tracks `ref()` in its compute and not just `active()`. The
    // container is created by the same signal flip, so the ref lands *after* this effect's
    // first run for that change — and `active`, its only other dependency, never changes
    // again.
    const [active, setActive] = createSignal(false);
    const { dispose } = mount(() => <LateRefHarness active={active} />);

    blurEverything();
    setActive(true);
    await expect.element(page.getByTestId("inside")).toHaveFocus();

    dispose();
  });

  it("does nothing while inactive", async () => {
    const { dispose } = mount(() => <TestHarness active={() => false} empty />);

    const outside = page.getByTestId("outside").element() as HTMLElement;
    outside.focus();

    await expect.element(page.getByTestId("outside")).toHaveFocus();
    await expect.element(page.getByTestId("container")).not.toHaveAttribute("tabindex");

    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <TestHarness active={() => true} />);
    await expectNoA11yViolations(container);
    dispose();
  });
});

/**
 * `createFocusTrap` composes this primitive, and creates its listener effect **first**. Both
 * halves of that decision are pinned here rather than in `create-focus-trap.browser.test.tsx`,
 * which stays untouched as the no-behavior-change gate for the extraction.
 */
describe("createFocusTrap composes createAutoFocus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("pulls an out-of-container `initialFocus` back inside", async () => {
    // The one behavioral difference the creation order buys: the `focusin` listener is
    // already attached when autofocus fires, so a trap whose `initialFocus` points outside
    // its container refuses it. Correct for a *trap* — and the assertion that goes red if
    // anyone creates `createAutoFocus` first.
    const [active, setActive] = createSignal(false);
    const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
    const [outsideRef, setOutsideRef] = createSignal<HTMLButtonElement>();

    const { dispose } = mount(() => {
      createFocusTrap({ active, ref: containerRef, initialFocus: outsideRef });
      return (
        <div>
          <button type="button" data-testid="outside" ref={setOutsideRef}>
            Outside
          </button>
          <div data-testid="container" ref={setContainerRef}>
            <button type="button" data-testid="inside">
              Inside
            </button>
          </div>
        </div>
      );
    });

    blurEverything();
    setActive(true);
    await expect.element(page.getByTestId("inside")).toHaveFocus();

    dispose();
  });

  it("removes its listeners before autofocus removes the `tabindex` it added", async () => {
    // Sibling effect cleanups run in *creation* order on a re-run, so listeners-first
    // reproduces exactly what the single welded effect did before the extraction.
    //
    // This asserts the teardown sequence rather than a DOM consequence of it, because
    // Chromium leaves no consequence to observe: dropping the `tabindex` from the focused
    // container fires `focusout` only — never `focusin` — so the trap's handler cannot react
    // even when it is still attached (measured, not assumed; see create-focus-trap.md).
    // The order is still the right one, and unpinned it would silently revert.
    const teardown: string[] = [];
    const [active, setActive] = createSignal(false);
    const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();

    const { dispose } = mount(() => {
      createFocusTrap({ active, ref: containerRef });
      return (
        // No focusable descendant — the only path that adds a `tabindex` to remove.
        <div data-testid="container" ref={setContainerRef}>
          <p>Nothing focusable here</p>
        </div>
      );
    });
    const container = page.getByTestId("container").element() as HTMLElement;

    blurEverything();
    setActive(true);
    await expect.element(page.getByTestId("container")).toHaveAttribute("tabindex", "-1");

    const removeEventListener = document.removeEventListener.bind(document);
    vi.spyOn(document, "removeEventListener").mockImplementation((type, ...rest) => {
      if (type === "focusin") {
        teardown.push("focusin listener");
      }
      removeEventListener(type, ...rest);
    });
    const removeAttribute = container.removeAttribute.bind(container);
    vi.spyOn(container, "removeAttribute").mockImplementation((name) => {
      if (name === "tabindex") {
        teardown.push("tabindex");
      }
      removeAttribute(name);
    });

    setActive(false);
    await expect.element(page.getByTestId("container")).not.toHaveAttribute("tabindex");
    expect(teardown).toEqual(["focusin listener", "tabindex"]);

    dispose();
  });
});
