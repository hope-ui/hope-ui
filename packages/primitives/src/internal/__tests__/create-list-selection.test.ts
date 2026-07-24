import { createRoot, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import type { CollectionItem } from "../create-collection";
import type { CreateListFocusReturn } from "../create-list-focus";
import { createListSelection, selectionRange } from "../create-list-selection";

// Pure range math — the one piece of selection logic with no reactive/DOM dependency, so it lives
// in the node `unit` project. Full selection behavior is exercised in the browser test.
describe("selectionRange", () => {
  it("returns the inclusive ascending range for an ascending pair", () => {
    expect(selectionRange(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it("normalizes a descending pair to ascending order", () => {
    expect(selectionRange(4, 1)).toEqual([1, 2, 3, 4]);
  });

  it("returns a single index when both ends are equal", () => {
    expect(selectionRange(2, 2)).toEqual([2]);
  });

  it("handles a zero-based anchor", () => {
    expect(selectionRange(0, 2)).toEqual([0, 1, 2]);
  });
});

// `firstSelectedIndex` reads only `focus.items()` + the selection value, so a minimal focus stub
// (the members `createListSelection` touches) keeps it in the node `unit` project rather than the
// browser. `flush` wraps the writes because solid-js's *client* build defers signal writes.
function item(value: string): CollectionItem<string> {
  return {
    id: value,
    element: () => undefined,
    disabled: () => false,
    textValue: () => value,
    value: () => value,
  };
}

function focusStub(items: CollectionItem<string>[]): CreateListFocusReturn<string> {
  return {
    items: () => items,
    activeIndex: () => -1,
    activeItem: () => undefined,
    isFocusable: () => true,
  } as unknown as CreateListFocusReturn<string>;
}

// The instance is built inside `createRoot` but the writes (`select`) run in the test body, outside
// the root's synchronous execution — writing during that run trips `REACTIVE_WRITE_IN_OWNED_SCOPE`.
// Same `setup`-then-`flush` shape as `calendar-root.test.ts`.
function setup(items: CollectionItem<string>[]): {
  selection: ReturnType<typeof createListSelection<string>>;
  dispose: () => void;
} {
  let selection!: ReturnType<typeof createListSelection<string>>;
  let dispose!: () => void;
  createRoot((d) => {
    dispose = d;
    selection = createListSelection<string>({
      focus: focusStub(items),
      selectionMode: () => "multiple",
    });
  });
  return { selection, dispose };
}

describe("firstSelectedIndex", () => {
  it("is -1 when nothing is selected", () => {
    const { selection, dispose } = setup([item("a"), item("b"), item("c")]);
    expect(selection.firstSelectedIndex()).toBe(-1);
    dispose();
  });

  it("is the lowest index in item order that is selected, regardless of selection order", () => {
    const items = [item("a"), item("b"), item("c")];
    const { selection, dispose } = setup(items);
    // Select "c" then "b" — item order (b before c), not selection order, decides the result.
    flush(() => selection.select(nth(items, 2)));
    flush(() => selection.select(nth(items, 1)));
    expect(selection.firstSelectedIndex()).toBe(1);
    dispose();
  });
});

/** Array access that asserts presence — under `noUncheckedIndexedAccess`, `list[i]` is `T | undefined`. */
function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value === undefined) {
    throw new Error(`no element at index ${index}`);
  }
  return value;
}
