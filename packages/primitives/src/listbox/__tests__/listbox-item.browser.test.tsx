import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { CreateListboxReturn } from "../index";
import {
  activeValues,
  CollectionListbox,
  FRUITS,
  type Fruit,
  fruitOptions,
  nth,
  options,
  selectedValues,
} from "./listbox-harness";

const label = (fruit: Fruit) => fruit.name;

/** Dispatch a real `pointermove` at explicit client coords — the fight-guard reads clientX/clientY. */
function pointerMoveAt(element: HTMLElement, x: number, y: number): void {
  element.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, bubbles: true }));
}

describe("createListboxItem — attributes", () => {
  it("emits role=option and reflects selected/disabled/active state as ARIA + data-*", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <CollectionListbox
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
});

describe("createListboxItem — pointer / click", () => {
  it("clicking an item focuses and selects it", async () => {
    const { container, dispose } = mount(() => (
      <CollectionListbox values={FRUITS} labelOf={label} options={fruitOptions()} />
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
      <CollectionListbox values={FRUITS} labelOf={label} options={fruitOptions()} />
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
      <CollectionListbox
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

    // A pointermove fired WITHOUT motion (same coords) — e.g. the list scrolled under a still
    // cursor — must NOT yank the active item back to Apple.
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
      <CollectionListbox
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
