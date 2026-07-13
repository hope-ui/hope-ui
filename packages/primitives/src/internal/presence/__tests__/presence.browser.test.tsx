import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createPresence, createPresenceItem } from "../presence";

function TestHarness(props: {
  present: () => boolean;
  /** When set, applies `transition: opacity {ms}ms linear` to the popup. */
  transitionMs?: number;
  /** Whether opacity actually changes on exit. `false` means no transition runs (no end event). */
  changeOpacity?: boolean;
  /** When it returns `true`, the popup gets `display: none` — used to cancel a running transition. */
  hidden?: () => boolean;
  initialEnter?: boolean;
}) {
  // A signal-backed ref, not `let ref; ref={ref}`. `createPresence` happens to get away with
  // the plain `let` — it only reads the ref on the *exit* edge, by which point the element
  // exists and the variable is populated. But the pattern is wrong for every sibling
  // primitive (see focus-trap.md), and the moment one ref is shared between them, the `let`
  // version silently breaks the others. Not worth demonstrating anywhere.
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const { mounted, status } = createPresence({
    present: props.present,
    ref,
    initialEnter: props.initialEnter,
  });

  return (
    <Show when={mounted()}>
      <div
        data-testid="popup"
        data-presence={status()}
        ref={setRef}
        style={
          props.transitionMs == null
            ? undefined
            : {
                transition: `opacity ${props.transitionMs}ms linear`,
                opacity: (props.changeOpacity ?? true) && status() === "exiting" ? "0" : "1",
                display: props.hidden?.() ? "none" : undefined,
              }
        }
      >
        content
      </div>
    </Show>
  );
}

function ItemHarness(props: { item: () => string | undefined; transitionMs?: number }) {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const { mounted, status, mountedItem } = createPresenceItem<string>({
    item: props.item,
    ref,
  });

  return (
    <Show when={mounted()}>
      <div
        data-testid="popup"
        data-presence={status()}
        data-item={mountedItem()}
        ref={setRef}
        style={
          props.transitionMs == null
            ? undefined
            : {
                transition: `opacity ${props.transitionMs}ms linear`,
                opacity: status() === "exiting" ? "0" : "1",
              }
        }
      >
        {mountedItem()}
      </div>
    </Show>
  );
}

function popupOf(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-testid="popup"]');
}

describe("createPresence", () => {
  it("is not mounted when present starts false", () => {
    const [present] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness present={present} />);

    expect(popupOf(container)).toBeNull();
    dispose();
  });

  it("mounts immediately and transitions to 'entered' when present becomes true", async () => {
    const [present, setPresent] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness present={present} />);

    setPresent(true);
    await vi.waitFor(() => expect(popupOf(container)).toBeTruthy());
    await vi.waitFor(() =>
      expect(popupOf(container)?.getAttribute("data-presence")).toBe("entered"),
    );

    dispose();
  });

  it("appears already 'entered' on first mount by default (no enter animation)", () => {
    const [present] = createSignal(true);
    const { container, dispose } = mount(() => (
      <TestHarness present={present} transitionMs={150} />
    ));

    // The default first-run latch lands directly on `entered`, so a `defaultOpen` element doesn't
    // replay its transition on mount.
    expect(popupOf(container)?.getAttribute("data-presence")).toBe("entered");
    dispose();
  });

  it("plays the enter animation on first mount when initialEnter is set", async () => {
    const [present] = createSignal(true);
    const { container, dispose } = mount(() => (
      <TestHarness present={present} initialEnter transitionMs={150} />
    ));

    expect(popupOf(container)?.getAttribute("data-presence")).toBe("entering");
    await vi.waitFor(() =>
      expect(popupOf(container)?.getAttribute("data-presence")).toBe("entered"),
    );

    dispose();
  });

  it("unmounts immediately when present becomes false and there is no CSS transition/animation", async () => {
    const [present, setPresent] = createSignal(true);
    const { container, dispose } = mount(() => <TestHarness present={present} />);

    await vi.waitFor(() => expect(popupOf(container)).toBeTruthy());
    setPresent(false);
    await vi.waitFor(() => expect(popupOf(container)).toBeNull());

    dispose();
  });

  it("stays mounted with status 'exiting' until the CSS transition ends, then unmounts", async () => {
    const [present, setPresent] = createSignal(true);
    const { container, dispose } = mount(() => (
      <TestHarness present={present} transitionMs={150} />
    ));

    await vi.waitFor(() => expect(popupOf(container)).toBeTruthy());
    setPresent(false);

    await vi.waitFor(() =>
      expect(popupOf(container)?.getAttribute("data-presence")).toBe("exiting"),
    );
    expect(popupOf(container)).toBeTruthy();

    await vi.waitFor(() => expect(popupOf(container)).toBeNull(), { timeout: 2000 });

    dispose();
  });

  it("unmounts via the fallback timer when the exit end event never fires", async () => {
    const [present, setPresent] = createSignal(true);
    const { container, dispose } = mount(() => (
      <TestHarness present={present} transitionMs={80} changeOpacity={false} />
    ));

    await vi.waitFor(() => expect(popupOf(container)).toBeTruthy());
    setPresent(false);

    // A transition is declared (so `getComputedStyle` reports a duration and we wait), but opacity
    // never changes, so no `transitionend`/`animationend` can ever fire. Only the fallback timer
    // can unmount this — if it were absent the element would stay mounted forever.
    await vi.waitFor(() =>
      expect(popupOf(container)?.getAttribute("data-presence")).toBe("exiting"),
    );
    await vi.waitFor(() => expect(popupOf(container)).toBeNull(), { timeout: 1000 });

    dispose();
  });

  it("unmounts on transitioncancel when the exit transition is interrupted", async () => {
    const [present, setPresent] = createSignal(true);
    const [hidden, setHidden] = createSignal(false);
    const { container, dispose } = mount(() => (
      <TestHarness present={present} transitionMs={5000} hidden={hidden} />
    ));

    await vi.waitFor(() => expect(popupOf(container)).toBeTruthy());
    setPresent(false);
    await vi.waitFor(() =>
      expect(popupOf(container)?.getAttribute("data-presence")).toBe("exiting"),
    );

    // Interrupt the running 5s transition with `display: none`, which fires `transitioncancel`.
    // The element must unmount well before the 5s fallback timer — proving the cancel event, not
    // the timer, drove it.
    setHidden(true);
    await vi.waitFor(() => expect(popupOf(container)).toBeNull(), { timeout: 1500 });

    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const [present] = createSignal(true);
    const { container, dispose } = mount(() => <TestHarness present={present} />);
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createPresenceItem", () => {
  it("mounts and unmounts based on item presence", async () => {
    const [item, setItem] = createSignal<string | undefined>(undefined);
    const { container, dispose } = mount(() => <ItemHarness item={item} />);

    expect(popupOf(container)).toBeNull();

    setItem("a");
    await vi.waitFor(() => expect(popupOf(container)?.getAttribute("data-item")).toBe("a"));

    setItem(undefined);
    await vi.waitFor(() => expect(popupOf(container)).toBeNull());

    dispose();
  });

  it("keeps the outgoing item mounted through its exit transition before swapping in the new one", async () => {
    const [item, setItem] = createSignal<string | undefined>("a");
    const { container, dispose } = mount(() => <ItemHarness item={item} transitionMs={150} />);

    await vi.waitFor(() => expect(popupOf(container)?.getAttribute("data-item")).toBe("a"));

    setItem("b");
    // "a" keeps showing while it exits...
    await vi.waitFor(() =>
      expect(popupOf(container)?.getAttribute("data-presence")).toBe("exiting"),
    );
    expect(popupOf(container)?.getAttribute("data-item")).toBe("a");

    // ...then "b" swaps in once "a" has finished exiting.
    await vi.waitFor(() => expect(popupOf(container)?.getAttribute("data-item")).toBe("b"), {
      timeout: 2000,
    });

    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const [item] = createSignal<string | undefined>("a");
    const { container, dispose } = mount(() => <ItemHarness item={item} />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
