import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type CreateListboxReturn, createListbox, createListboxItem } from "../index";
import {
  activeValues,
  DataListbox,
  FRUITS,
  type Fruit,
  fruitOptions,
  listbox,
  mountedIndices,
  nth,
  options,
  selectedValues,
  VirtualListbox,
} from "./listbox-harness";

const label = (fruit: Fruit) => fruit.name;

/** Dispatch a real `pointermove` at explicit client coords — the fight-guard reads clientX/clientY. */
function pointerMoveAt(element: HTMLElement, x: number, y: number): void {
  element.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, bubbles: true }));
}

function rowAt(container: HTMLElement, index: number): HTMLElement {
  return container.querySelector(`[data-index="${index}"]`) as HTMLElement;
}

/**
 * A one-option listbox that hands `createListboxItem` whatever extra props a test passes. It targets
 * the two things a props change breaks silently: an attribute the hand-kept `omit` list stops
 * forwarding, and an `item` the data never contained.
 */
function ProbeListbox(props: {
  item?: Fruit;
  // `data-testid` is spelled out because Solid's `HTMLAttributes` accepts arbitrary `data-*` only
  // through JSX, not in a plain object literal.
  extra?: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & { "data-testid"?: string };
}): JSX.Element {
  const state = createListbox<Fruit>({ items: FRUITS, ...fruitOptions() });
  const probed = () => props.item ?? (FRUITS[0] as Fruit);
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const item = createListboxItem<Fruit>(state, { ...props.extra, ref, item: probed() });
  return (
    <div
      ref={(element) => state.setListboxElement(element)}
      {...state.rootProps}
      // Repeated from `rootProps` with the same value so biome's a11y lint can see the role behind
      // the spread. Same shape as `GroupedListbox` / `VirtualListbox`.
      role="listbox"
      aria-label="fruits"
    >
      <div ref={setRef} {...item.props}>
        {probed().name}
      </div>
    </div>
  );
}

describe("createListboxItem — attributes", () => {
  it("emits role=option and reflects selected/disabled/active state as ARIA + data-*", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        disabledOf={(fruit) => fruit.name === "Date"}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    const apple = nth(options(container), 0);
    const date = nth(options(container), 3);

    expect(apple.getAttribute("role")).toBe("option");
    expect(apple.getAttribute("aria-selected")).toBe("false");
    expect(apple.hasAttribute("data-selected")).toBe(false);
    expect(apple.hasAttribute("data-active")).toBe(false);

    expect(date.getAttribute("aria-disabled")).toBe("true");
    expect(date.hasAttribute("data-disabled")).toBe(true);

    state.focus.focusIndex(0);
    state.selection.selectOne(nth(state.focus.items(), 0));
    await vi.waitFor(() => {
      expect(apple.getAttribute("aria-selected")).toBe("true");
      expect(apple.hasAttribute("data-selected")).toBe(true);
      expect(apple.hasAttribute("data-active")).toBe(true);
    });
    await expectNoA11yViolations(container);
    dispose();
  });

  it("forwards the native attributes it does not own onto the option element", async () => {
    // The `omit` list is hand-kept, so a renamed control prop can quietly start swallowing a
    // consumer's attributes with a green typecheck and a green suite. Assert them **on the element**
    // rather than on the props object — the element is the only place that drift shows.
    const { container, dispose } = mount(() => (
      <ProbeListbox
        extra={{
          "data-testid": "probe",
          "aria-describedby": "hint",
          title: "Pick me",
          class: "probe-class",
          style: { color: "rgb(1, 2, 3)" },
        }}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(1));

    const option = nth(options(container), 0);
    expect(option.getAttribute("data-testid")).toBe("probe");
    expect(option.getAttribute("aria-describedby")).toBe("hint");
    expect(option.getAttribute("title")).toBe("Pick me");
    expect(option.classList.contains("probe-class")).toBe(true);
    expect(option.style.color).toBe("rgb(1, 2, 3)");
    // …while the hook keeps the ones it owns. `id` is deliberately not forwardable: it is what
    // `aria-activedescendant` points at, generated per row by the item source.
    expect(option.getAttribute("role")).toBe("option");
    expect(option.id).toBeTruthy();
    dispose();
  });

  it("warns in dev when the item is not in the listbox's items", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container, dispose } = mount(() => <ProbeListbox item={{ id: 99, name: "Ghost" }} />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(1));

    // Arrow keys and typeahead traverse `items`, not the DOM, so a row outside it is unreachable —
    // and nothing else says so: it renders fine, it just never activates.
    await vi.waitFor(() =>
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("[hope-ui] createListboxItem")),
    );
    expect(warn.mock.calls.flat().join(" ")).toContain('"99"');

    warn.mockRestore();
    dispose();
  });
});

describe("createListboxItem — registration", () => {
  it("re-registers a row under its new index when the data reorders", async () => {
    // The registration effect tracks the index *and* the ref, which is what makes a moved row publish
    // itself under its new slot and clear the old one. Reading the index in the effect body instead
    // would be an untracked read of a memo (`[STRICT_READ_UNTRACKED]`, which `mount()` fails on), so
    // this also pins that the effect keeps its two-argument `(compute, effect)` shape.
    const [values, setValues] = createSignal<Fruit[]>(FRUITS);
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={values()}
        labelOf={label}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() =>
      expect(nth(state.indexed.items(), 0).element()?.textContent).toBe("Apple"),
    );

    flush(() => setValues([...FRUITS].reverse()));

    await vi.waitFor(() => {
      expect(nth(state.indexed.items(), 0).element()?.textContent).toBe("Date");
      expect(nth(state.indexed.items(), 3).element()?.textContent).toBe("Apple");
    });
    // Every slot still resolves — nothing was left registered under a stale index.
    for (const item of state.indexed.items()) {
      expect(item.element()).toBeDefined();
    }
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createListboxItem — pointer / click", () => {
  it("clicking an item focuses and selects it", async () => {
    const { container, dispose } = mount(() => (
      <DataListbox values={FRUITS} labelOf={label} options={fruitOptions()} />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    await userEvent.click(nth(options(container), 2)); // Cherry
    await vi.waitFor(() => {
      expect(selectedValues(container)).toEqual(["Cherry"]);
      expect(activeValues(container)).toEqual(["Cherry"]);
    });
    await expect.element(nth(options(container), 2)).toHaveFocus();
    dispose();
  });

  it("pointer move re-targets the single active item (no second highlight)", async () => {
    const { container, dispose } = mount(() => (
      <DataListbox values={FRUITS} labelOf={label} options={fruitOptions()} />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    pointerMoveAt(nth(options(container), 0), 10, 10);
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Apple"]));

    pointerMoveAt(nth(options(container), 2), 10, 40);
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Cherry"]));
    // Exactly one item is ever active — hovering moved the highlight, it did not add a second.
    expect(activeValues(container)).toHaveLength(1);
    dispose();
  });

  it("does not re-target on a spurious pointermove at unchanged coords (keyboard wins the fight)", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    // Real hover records the pointer position over Apple.
    pointerMoveAt(nth(options(container), 0), 10, 10);
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Apple"]));

    // Keyboard moves the active item down.
    state.focus.focusIndex(0);
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Banana"]));

    // A pointermove fired WITHOUT motion (same coords) — what the browser emits when the list scrolls
    // under a stationary cursor — must NOT yank the active item back to Apple.
    pointerMoveAt(nth(options(container), 0), 10, 10);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(activeValues(container)).toEqual(["Banana"]);
    expect(activeValues(container)).toHaveLength(1);

    // A genuine move (different coords) re-targets again.
    pointerMoveAt(nth(options(container), 0), 10, 12);
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Apple"]));
    dispose();
  });

  it("ignores pointer move on a disabled item", async () => {
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        disabledOf={(fruit) => fruit.name === "Banana"}
        options={fruitOptions()}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    pointerMoveAt(nth(options(container), 1), 10, 25); // Banana is disabled
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(activeValues(container)).toEqual([]);
    dispose();
  });
});

describe("createListboxItem — hover moves the highlight but never the scroll", () => {
  it("leaves the scroll alone on pointer move, while a click still reveals the row", async () => {
    let state!: CreateListboxReturn<number>;
    const { container, dispose } = mount(() => (
      <VirtualListbox
        count={50}
        rowHeight={30}
        viewport={100}
        // Activedescendant so DOM focus never moves: a real `.focus()` scrolls the element into view
        // by itself, which would mask whichever scroll behavior is under test.
        options={{ focusMode: "activedescendant" }}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(mountedIndices(container)).toContain(3));

    const list = listbox(container);
    expect(list.scrollTop).toBe(0);

    // Row 3 spans [90, 120) in a 100px port: mounted and hoverable, but only 10px of it is visible.
    const clipped = rowAt(container, 3);
    pointerMoveAt(clipped, 10, 95);
    await vi.waitFor(() => expect(state.focus.activeIndex()).toBe(3));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(list.scrollTop).toBe(0);

    // Clicking the same row does scroll — only the pointer-move path opts out. A bare `.click()`,
    // because `userEvent.click` scrolls the target into view before pressing it.
    clipped.click();
    await vi.waitFor(() => expect(list.scrollTop).toBe(120 - 100));
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createListboxItem — highlight follows focus", () => {
  it("clears data-active when focus leaves the list, keeps the active index, and repaints on return", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    state.focus.focusIndex(0);
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Apple"]));

    // Blur moves DOM focus to <body>, outside the list — the highlight must not linger.
    nth(options(container), 0).blur();
    await vi.waitFor(() => expect(activeValues(container)).toEqual([]));
    // Only the paint gate closed; the position is retained, so returning lands on the same row.
    expect(state.focus.activeIndex()).toBe(0);

    // Returning focus repaints the same row.
    nth(options(container), 0).focus();
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Apple"]));
    dispose();
  });
});
