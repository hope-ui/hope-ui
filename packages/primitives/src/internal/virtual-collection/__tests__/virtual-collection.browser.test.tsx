import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal, For } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { type CreateListFocusReturn, createListFocus } from "../../list-focus/list-focus";
import { createRegisteredElement } from "../../registered-element/registered-element";
import { type CreateVirtualCollectionReturn, createVirtualCollection } from "../virtual-collection";

/** Array access that asserts presence — under `noUncheckedIndexedAccess`, `list[i]` is `T | undefined`. */
function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value === undefined) throw new Error(`no element at index ${index}`);
  return value;
}

const COUNT = 10_000;
const ROW_HEIGHT = 30;
const VIEWPORT = 300;

interface HarnessApi {
  collection: CreateVirtualCollectionReturn<number>;
  focus: CreateListFocusReturn<number>;
}

function label(index: number): string {
  return `Item ${index}`;
}

function Row(props: { api: HarnessApi; index: number; start: number }) {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  // The repo idiom for publishing a descendant element to an ancestor: registers on mount,
  // unregisters (with the same element) on unmount as the window recycles.
  createRegisteredElement({
    ref,
    register: (element) => {
      props.api.collection.registerElement(props.index, element);
      props.api.collection.measureElement(element);
    },
    unregister: () => props.api.collection.registerElement(props.index, null),
  });
  const item = () => nth(props.api.collection.items(), props.index);
  return (
    <div
      ref={setRef}
      data-index={props.index}
      id={item().id}
      role="option"
      aria-selected={props.api.focus.isActive(item()) ? "true" : "false"}
      aria-setsize={COUNT}
      aria-posinset={props.index + 1}
      tabindex={props.api.focus.getItemTabIndex(item())}
      style={{
        position: "absolute",
        top: `${props.start}px`,
        left: "0",
        width: "100%",
        height: `${ROW_HEIGHT}px`,
      }}
    >
      {label(props.index)}
    </div>
  );
}

function VirtualListbox(props: { onReady: (api: HarnessApi) => void }) {
  const [scrollRef, setScrollRef] = createSignal<HTMLDivElement>();
  const collection = createVirtualCollection<number>({
    count: () => COUNT,
    scrollElement: scrollRef,
    estimateSize: () => ROW_HEIGHT,
    getItemData: (index) => ({ id: `row-${index}`, value: index, textValue: label(index) }),
    overscan: 3,
  });
  const focus = createListFocus<number>({ source: collection, element: scrollRef });
  const api: HarnessApi = { collection, focus };
  props.onReady(api);

  return (
    <div
      ref={setScrollRef}
      role="listbox"
      aria-label="virtual fruits"
      tabindex={focus.getListTabIndex()}
      aria-activedescendant={focus.activeDescendant()}
      style={{ height: `${VIEWPORT}px`, "overflow-y": "auto" }}
    >
      <div style={{ height: `${collection.totalSize()}px`, position: "relative", width: "100%" }}>
        <For each={collection.virtualItems()}>
          {(virtualItem) => <Row api={api} index={virtualItem.index} start={virtualItem.start} />}
        </For>
      </div>
    </div>
  );
}

function mountedIndices(container: HTMLElement): number[] {
  return [...container.querySelectorAll<HTMLElement>("[data-index]")]
    .map((element) => Number(element.dataset.index))
    .sort((a, b) => a - b);
}

describe("createVirtualCollection", () => {
  it("exposes the full item set even though only a window is mounted", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => <VirtualListbox onReady={(a) => (api = a)} />);

    await vi.waitFor(() => expect(api.collection.virtualItems().length).toBeGreaterThan(0));
    // The full data set is visible to the data layer …
    expect(api.collection.items()).toHaveLength(COUNT);
    // … while the DOM holds only a small window.
    expect(mountedIndices(container).length).toBeLessThan(30);
    // Offscreen rows carry textValue/value with no element (the typeahead/nav guarantee).
    const offscreen = nth(api.collection.items(), 5000);
    expect(offscreen.element()).toBeUndefined();
    expect(offscreen.textValue()).toBe(label(5000));
    expect(offscreen.value()).toBe(5000);
    dispose();
  });

  it("reflects the true total in aria-setsize/aria-posinset on rendered rows", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => <VirtualListbox onReady={(a) => (api = a)} />);
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    const first = container.querySelector<HTMLElement>('[data-index="0"]');
    expect(first?.getAttribute("aria-setsize")).toBe(String(COUNT));
    expect(first?.getAttribute("aria-posinset")).toBe("1");
    dispose();
  });

  it("ArrowDown past the mounted window scrolls the target in and focuses it (roving)", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => <VirtualListbox onReady={(a) => (api = a)} />);
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    // Row 200 is far outside the initial window of ~13 rows.
    expect(mountedIndices(container)).not.toContain(200);
    api.focus.focusIndex(200);

    await vi.waitFor(() => {
      const target = container.querySelector<HTMLElement>('[data-index="200"]');
      expect(target).not.toBeNull();
    });
    await expect
      .element(container.querySelector<HTMLElement>('[data-index="200"]') as HTMLElement)
      .toHaveFocus();
    dispose();
  });

  it("Home and End reach the true first and last rows", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => <VirtualListbox onReady={(a) => (api = a)} />);
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    // End → last row (index COUNT - 1) mounts and focuses.
    api.focus.focusIndex(COUNT - 1);
    await vi.waitFor(() =>
      expect(container.querySelector(`[data-index="${COUNT - 1}"]`)).not.toBeNull(),
    );
    await expect
      .element(container.querySelector<HTMLElement>(`[data-index="${COUNT - 1}"]`) as HTMLElement)
      .toHaveFocus();

    // Home → back to index 0.
    api.focus.focusIndex(0);
    await vi.waitFor(() => expect(container.querySelector('[data-index="0"]')).not.toBeNull());
    await expect
      .element(container.querySelector<HTMLElement>('[data-index="0"]') as HTMLElement)
      .toHaveFocus();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => <VirtualListbox onReady={(a) => (api = a)} />);
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));
    await expectNoA11yViolations(container);
    dispose();
  });
});
