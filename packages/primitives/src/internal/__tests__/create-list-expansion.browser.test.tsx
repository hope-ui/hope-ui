import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { type Accessor, createSignal, For } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  type CollectionItem,
  type CreateCollectionReturn,
  createCollection,
} from "../create-collection";
import {
  type CreateListExpansionReturn,
  createListExpansion,
  type ExpansionMode,
} from "../create-list-expansion";

interface HarnessApi {
  collection: CreateCollectionReturn<string>;
  expansion: CreateListExpansionReturn<string>;
}

function AccordionItem(props: { api: HarnessApi; value: string; disabled?: boolean }) {
  const [ref, setRef] = createSignal<HTMLButtonElement>();
  const item: CollectionItem<string> = props.api.collection.register({
    ref,
    value: () => props.value,
    disabled: () => props.disabled ?? false,
  });
  const buttonId = `trigger-${props.value}`;
  const panelId = `panel-${props.value}`;
  return (
    <div>
      <h3>
        <button
          ref={setRef}
          id={buttonId}
          type="button"
          aria-expanded={props.api.expansion.isExpanded(item) ? "true" : "false"}
          aria-controls={panelId}
          disabled={props.disabled}
          data-value={props.value}
          onClick={() => props.api.expansion.toggle(item)}
        >
          {props.value}
        </button>
      </h3>
      <div
        role="region"
        id={panelId}
        aria-labelledby={buttonId}
        hidden={!props.api.expansion.isExpanded(item)}
      >
        Panel for {props.value}
      </div>
    </div>
  );
}

function AccordionHarness(props: {
  values: string[];
  disabledValues?: string[];
  expansionMode?: Accessor<ExpansionMode>;
  collapsible?: Accessor<boolean>;
  defaultValue?: string[];
  onReady: (api: HarnessApi) => void;
}) {
  const collection = createCollection<string>();
  const expansion = createListExpansion<string>({
    items: collection.items,
    expansionMode: props.expansionMode,
    collapsible: props.collapsible,
    defaultValue: props.defaultValue,
  });
  const api: HarnessApi = { collection, expansion };
  props.onReady(api);
  return (
    <div>
      <For each={props.values}>
        {(value) => (
          <AccordionItem api={api} value={value} disabled={props.disabledValues?.includes(value)} />
        )}
      </For>
    </div>
  );
}

function triggerFor(container: HTMLElement, value: string): HTMLElement {
  return container.querySelector<HTMLElement>(`[data-value="${value}"]`) as HTMLElement;
}
function expanded(container: HTMLElement): string[] {
  return [...container.querySelectorAll<HTMLElement>("[data-value]")]
    .filter((element) => element.getAttribute("aria-expanded") === "true")
    .map((element) => element.dataset.value as string);
}

describe("createListExpansion — multiple (default)", () => {
  it("expands several items independently", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <AccordionHarness values={["a", "b", "c"]} onReady={(x) => (api = x)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    await userEvent.click(triggerFor(container, "a"));
    await userEvent.click(triggerFor(container, "c"));
    await vi.waitFor(() => expect(expanded(container).sort()).toEqual(["a", "c"]));

    // Clicking an open item collapses just it.
    await userEvent.click(triggerFor(container, "a"));
    await vi.waitFor(() => expect(expanded(container)).toEqual(["c"]));
    dispose();
  });

  it("expandAll / collapseAll", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <AccordionHarness values={["a", "b", "c"]} onReady={(x) => (api = x)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    api.expansion.expandAll();
    await vi.waitFor(() => expect(expanded(container).sort()).toEqual(["a", "b", "c"]));

    api.expansion.collapseAll();
    await vi.waitFor(() => expect(expanded(container)).toEqual([]));
    dispose();
  });

  it("cannot expand a disabled item", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <AccordionHarness values={["a", "b"]} disabledValues={["b"]} onReady={(x) => (api = x)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(2));

    const item = api.collection.items()[1];
    if (!item) {
      throw new Error("expected item at index 1");
    }
    api.expansion.expand(item);
    await vi.waitFor(() => expect(api.expansion.expandedValues()).toEqual([]));
    // expandAll skips it too.
    api.expansion.expandAll();
    await vi.waitFor(() => expect(expanded(container)).toEqual(["a"]));
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <AccordionHarness values={["a", "b"]} defaultValue={["a"]} onReady={(x) => (api = x)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(2));
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createListExpansion — single (accordion)", () => {
  const single = () => "single" as const;

  it("keeps only one item open at a time", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <AccordionHarness
        values={["a", "b", "c"]}
        expansionMode={single}
        onReady={(x) => (api = x)}
      />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    await userEvent.click(triggerFor(container, "a"));
    await vi.waitFor(() => expect(expanded(container)).toEqual(["a"]));

    await userEvent.click(triggerFor(container, "b"));
    await vi.waitFor(() => expect(expanded(container)).toEqual(["b"])); // a auto-collapsed
    dispose();
  });

  it("collapsible: clicking the open item closes it", async () => {
    let api!: HarnessApi;
    const collapsible = () => true;
    const { container, dispose } = mount(() => (
      <AccordionHarness
        values={["a", "b"]}
        expansionMode={single}
        collapsible={collapsible}
        onReady={(x) => (api = x)}
      />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(2));

    await userEvent.click(triggerFor(container, "a"));
    await vi.waitFor(() => expect(expanded(container)).toEqual(["a"]));
    await userEvent.click(triggerFor(container, "a"));
    await vi.waitFor(() => expect(expanded(container)).toEqual([]));
    dispose();
  });

  it("non-collapsible: the open item stays open when re-clicked", async () => {
    let api!: HarnessApi;
    const collapsible = () => false;
    const { container, dispose } = mount(() => (
      <AccordionHarness
        values={["a", "b"]}
        expansionMode={single}
        collapsible={collapsible}
        defaultValue={["a"]}
        onReady={(x) => (api = x)}
      />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(2));

    await userEvent.click(triggerFor(container, "a"));
    // Stays open — a non-collapsible accordion must keep one panel open.
    await vi.waitFor(() => expect(expanded(container)).toEqual(["a"]));
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <AccordionHarness
        values={["a", "b"]}
        expansionMode={single}
        defaultValue={["a"]}
        onReady={(x) => (api = x)}
      />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(2));
    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Object values ──────────────────────────────────────────────────────────────────────────────
// An expansion key need not be a primitive or a reference-stable object: `itemToValue` maps each
// value to an identity key compared with `===`, and `isItemEqualToValue` overrides the rule entirely.

interface Panel {
  id: number;
  name: string;
}

interface ObjApi {
  collection: CreateCollectionReturn<Panel>;
  expansion: CreateListExpansionReturn<Panel>;
}

function ObjAccordion(props: {
  panels: Panel[];
  value?: Accessor<Panel[]>;
  itemToValue?: (panel: Panel) => unknown;
  isItemEqualToValue?: (a: Panel, b: Panel) => boolean;
  onReady: (api: ObjApi) => void;
}) {
  const collection = createCollection<Panel>();
  const expansion = createListExpansion<Panel>({
    items: collection.items,
    value: props.value,
    itemToValue: props.itemToValue,
    isItemEqualToValue: props.isItemEqualToValue,
  });
  props.onReady({ collection, expansion });
  return (
    <div>
      <For each={props.panels}>
        {(panel) => {
          const [ref, setRef] = createSignal<HTMLButtonElement>();
          const item = collection.register({ ref, value: () => panel });
          const panelId = `p-${panel.id}`;
          return (
            <div>
              <button
                ref={setRef}
                type="button"
                id={`t-${panel.id}`}
                aria-expanded={expansion.isExpanded(item) ? "true" : "false"}
                aria-controls={panelId}
                data-id={panel.id}
                onClick={() => expansion.toggle(item)}
              >
                {panel.name}
              </button>
              <div
                role="region"
                id={panelId}
                aria-labelledby={`t-${panel.id}`}
                hidden={!expansion.isExpanded(item)}
              >
                Body {panel.name}
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}

function expandedIds(container: HTMLElement): string[] {
  return [...container.querySelectorAll<HTMLElement>("[data-id]")]
    .filter((element) => element.getAttribute("aria-expanded") === "true")
    .map((element) => element.dataset.id as string);
}

describe("createListExpansion — object values", () => {
  const PANELS: Panel[] = [
    { id: 1, name: "One" },
    { id: 2, name: "Two" },
    { id: 3, name: "Three" },
  ];

  const byId = (panel: Panel) => panel.id;

  it("expands the matching panel when a controlled value maps to the same itemToValue key but a fresh reference", async () => {
    let api!: ObjApi;
    // Fresh object, not the registered `Two` reference — only the id key matches.
    const value = () => [{ id: 2, name: "Two (from server)" }];
    const { container, dispose } = mount(() => (
      <ObjAccordion panels={PANELS} value={value} itemToValue={byId} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    // Reference equality would miss this; the id-key `itemToValue` matches it.
    await vi.waitFor(() => expect(expandedIds(container)).toEqual(["2"]));
    dispose();
  });

  it("toggles object-keyed panels through the itemToValue key", async () => {
    let api!: ObjApi;
    const { container, dispose } = mount(() => (
      <ObjAccordion panels={PANELS} itemToValue={byId} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    await userEvent.click(container.querySelector('[data-id="1"]') as HTMLElement);
    await userEvent.click(container.querySelector('[data-id="3"]') as HTMLElement);
    await vi.waitFor(() => expect(expandedIds(container).sort()).toEqual(["1", "3"]));

    await userEvent.click(container.querySelector('[data-id="1"]') as HTMLElement);
    await vi.waitFor(() => expect(expandedIds(container)).toEqual(["3"]));
    dispose();
  });

  it("defaults to reference/=== equality when no itemToValue is given", async () => {
    let api!: ObjApi;
    // A fresh object with the same id does NOT match under the default identity `itemToValue`,
    // because the default equality is plain `===` on the value itself.
    const value = () => [{ id: 2, name: "Two (from server)" }];
    const { container, dispose } = mount(() => (
      <ObjAccordion panels={PANELS} value={value} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    // Nothing expanded: the controlled value is a different reference than any registered panel.
    await vi.waitFor(() => expect(expandedIds(container)).toEqual([]));
    dispose();
  });

  it("honors a custom isItemEqualToValue", async () => {
    let api!: ObjApi;
    // Compare by name instead of id: a value with a different id but matching name expands One.
    const value = () => [{ id: 99, name: "One" }];
    const isItemEqualToValue = (a: Panel, b: Panel) => a.name === b.name;
    const { container, dispose } = mount(() => (
      <ObjAccordion
        panels={PANELS}
        value={value}
        isItemEqualToValue={isItemEqualToValue}
        onReady={(a) => (api = a)}
      />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    await vi.waitFor(() => expect(expandedIds(container)).toEqual(["1"]));
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: ObjApi;
    const { container, dispose } = mount(() => (
      <ObjAccordion panels={PANELS} itemToValue={byId} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));
    await expectNoA11yViolations(container);
    dispose();
  });
});
