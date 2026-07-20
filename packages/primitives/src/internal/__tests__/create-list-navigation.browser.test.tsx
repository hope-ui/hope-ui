import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { type Accessor, createSignal, For } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  type CollectionItem,
  type CreateCollectionReturn,
  createCollection,
} from "../create-collection";
import { type CreateListFocusReturn, createListFocus } from "../create-list-focus";
import {
  type CreateListNavigationReturn,
  createListNavigation,
  type Orientation,
  type TextDirection,
} from "../create-list-navigation";

/** Array access that asserts presence — under `noUncheckedIndexedAccess`, `list[i]` is `T | undefined`. */
function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value === undefined) {
    throw new Error(`no element at index ${index}`);
  }
  return value;
}

interface HarnessApi {
  collection: CreateCollectionReturn<string>;
  focus: CreateListFocusReturn<string>;
  navigation: CreateListNavigationReturn;
}

function Option(props: {
  collection: CreateCollectionReturn<string>;
  focus: CreateListFocusReturn<string>;
  value: string;
  disabled?: boolean;
}) {
  const [ref, setRef] = createSignal<HTMLLIElement>();
  const item: CollectionItem<string> = props.collection.register({
    ref,
    value: () => props.value,
    disabled: () => props.disabled ?? false,
  });
  return (
    <li
      ref={setRef}
      id={item.id}
      role="option"
      aria-selected={props.focus.isActive(item) ? "true" : "false"}
      aria-disabled={props.disabled ? "true" : undefined}
      tabindex={props.focus.getItemTabIndex(item)}
      data-value={props.value}
    >
      {props.value}
    </li>
  );
}

function NavHarness(props: {
  values: string[];
  disabledValues?: string[];
  orientation?: Accessor<Orientation>;
  wrap?: Accessor<boolean>;
  textDirection?: Accessor<TextDirection>;
  onReady: (api: HarnessApi) => void;
}) {
  const collection = createCollection<string>();
  const [containerRef, setContainerRef] = createSignal<HTMLUListElement>();
  const focus = createListFocus<string>({ source: collection, element: containerRef });
  const navigation = createListNavigation<string>({
    focus,
    orientation: props.orientation,
    wrap: props.wrap,
    textDirection: props.textDirection,
  });
  props.onReady({ collection, focus, navigation });
  return (
    <ul
      ref={setContainerRef}
      role="listbox"
      aria-label="fruits"
      tabindex={focus.getListTabIndex()}
      onKeyDown={navigation.onKeyDown}
    >
      <For each={props.values}>
        {(value) => (
          <Option
            collection={collection}
            focus={focus}
            value={value}
            disabled={props.disabledValues?.includes(value)}
          />
        )}
      </For>
    </ul>
  );
}

function optionEls(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[role="option"]')];
}

async function ready(api: () => HarnessApi | undefined, length: number) {
  await vi.waitFor(() => expect(api()?.collection.items().length).toBe(length));
}

describe("createListNavigation — vertical (default)", () => {
  it("ArrowDown/ArrowUp move focus to the next/previous item", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <NavHarness values={["a", "b", "c"]} onReady={(a) => (api = a)} />
    ));
    await ready(() => api, 3);

    api.focus.focusIndex(0);
    await expect.element(nth(optionEls(container), 0)).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    await expect.element(nth(optionEls(container), 1)).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    await expect.element(nth(optionEls(container), 2)).toHaveFocus();

    await userEvent.keyboard("{ArrowUp}");
    await expect.element(nth(optionEls(container), 1)).toHaveFocus();
    dispose();
  });

  it("Home and End jump to the first and last item", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <NavHarness values={["a", "b", "c", "d"]} onReady={(a) => (api = a)} />
    ));
    await ready(() => api, 4);

    api.focus.focusIndex(1);
    await expect.element(nth(optionEls(container), 1)).toHaveFocus();

    await userEvent.keyboard("{End}");
    await expect.element(nth(optionEls(container), 3)).toHaveFocus();

    await userEvent.keyboard("{Home}");
    await expect.element(nth(optionEls(container), 0)).toHaveFocus();
    dispose();
  });

  it("clamps at the ends when wrap is off", async () => {
    let api!: HarnessApi;
    const wrap = () => false;
    const { container, dispose } = mount(() => (
      <NavHarness values={["a", "b"]} wrap={wrap} onReady={(a) => (api = a)} />
    ));
    await ready(() => api, 2);

    api.focus.focusIndex(1); // last
    await expect.element(nth(optionEls(container), 1)).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(nth(optionEls(container), 1)).toHaveFocus(); // stays
    dispose();
  });

  it("wraps around the ends when wrap is on", async () => {
    let api!: HarnessApi;
    const wrap = () => true;
    const { container, dispose } = mount(() => (
      <NavHarness values={["a", "b", "c"]} wrap={wrap} onReady={(a) => (api = a)} />
    ));
    await ready(() => api, 3);

    api.focus.focusIndex(2); // last
    await expect.element(nth(optionEls(container), 2)).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(nth(optionEls(container), 0)).toHaveFocus(); // wrapped to first

    await userEvent.keyboard("{ArrowUp}");
    await expect.element(nth(optionEls(container), 2)).toHaveFocus(); // wrapped back to last
    dispose();
  });

  it("skips disabled items", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <NavHarness
        values={["a", "b", "c", "d"]}
        disabledValues={["b", "c"]}
        onReady={(a) => (api = a)}
      />
    ));
    await ready(() => api, 4);

    api.focus.focusIndex(0);
    await expect.element(nth(optionEls(container), 0)).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    // b and c are disabled → lands on d.
    await expect.element(nth(optionEls(container), 3)).toHaveFocus();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <NavHarness values={["a", "b", "c"]} onReady={(a) => (api = a)} />
    ));
    await ready(() => api, 3);
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createListNavigation — horizontal & RTL", () => {
  it("maps ArrowRight/ArrowLeft in a horizontal list and ignores vertical arrows", async () => {
    let api!: HarnessApi;
    const orientation = () => "horizontal" as const;
    const { container, dispose } = mount(() => (
      <NavHarness values={["a", "b", "c"]} orientation={orientation} onReady={(a) => (api = a)} />
    ));
    await ready(() => api, 3);

    api.focus.focusIndex(0);
    await expect.element(nth(optionEls(container), 0)).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await expect.element(nth(optionEls(container), 1)).toHaveFocus();

    // ArrowDown is off-axis in a horizontal list — no movement.
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(nth(optionEls(container), 1)).toHaveFocus();

    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(nth(optionEls(container), 0)).toHaveFocus();
    dispose();
  });

  it("swaps Left/Right under RTL", async () => {
    let api!: HarnessApi;
    const orientation = () => "horizontal" as const;
    const textDirection = () => "rtl" as const;
    const { container, dispose } = mount(() => (
      <NavHarness
        values={["a", "b", "c"]}
        orientation={orientation}
        textDirection={textDirection}
        onReady={(a) => (api = a)}
      />
    ));
    await ready(() => api, 3);

    api.focus.focusIndex(0);
    await expect.element(nth(optionEls(container), 0)).toHaveFocus();

    // In RTL, ArrowLeft advances (next).
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(nth(optionEls(container), 1)).toHaveFocus();

    // ArrowRight goes back (prev).
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(nth(optionEls(container), 0)).toHaveFocus();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: HarnessApi;
    const orientation = () => "horizontal" as const;
    const { container, dispose } = mount(() => (
      <NavHarness values={["a", "b", "c"]} orientation={orientation} onReady={(a) => (api = a)} />
    ));
    await ready(() => api, 3);
    await expectNoA11yViolations(container);
    dispose();
  });
});
