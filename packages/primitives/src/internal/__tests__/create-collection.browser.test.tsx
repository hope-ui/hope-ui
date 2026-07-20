import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal, For, Show, untrack } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import {
  type CollectionItem,
  type CreateCollectionReturn,
  createCollection,
} from "../create-collection";

/** A single `<Listbox.Option>`-shaped part that registers itself with the ancestor collection. */
function Option<V>(props: {
  collection: CreateCollectionReturn<V>;
  value: V;
  disabled?: boolean;
  textValue?: string;
  onItem?: (item: CollectionItem<V>) => void;
}) {
  const [ref, setRef] = createSignal<HTMLLIElement>();
  const item = props.collection.register({
    ref,
    value: () => props.value,
    disabled: () => props.disabled ?? false,
    textValue: props.textValue === undefined ? undefined : () => props.textValue as string,
  });
  props.onItem?.(item);
  return (
    <li
      ref={setRef}
      id={item.id}
      role="option"
      aria-selected={false}
      data-value={String(props.value)}
    >
      {props.textValue ?? String(props.value)}
    </li>
  );
}

/** A listbox whose children are the source of truth (Model A, DOM-first registry). */
function Listbox<V>(props: {
  values: V[];
  disabledValues?: V[];
  onReady?: (collection: CreateCollectionReturn<V>) => void;
  prepend?: V;
}) {
  const collection = createCollection<V>();
  props.onReady?.(collection);
  return (
    <ul role="listbox" aria-label="fruits">
      <Show when={props.prepend !== undefined}>
        <Option collection={collection} value={props.prepend as V} />
      </Show>
      <For each={props.values}>
        {(value) => (
          <Option
            collection={collection}
            value={value}
            disabled={props.disabledValues?.includes(value)}
          />
        )}
      </For>
    </ul>
  );
}

function ids<V>(collection: CreateCollectionReturn<V>): string[] {
  return collection.items().map((item) => item.id);
}

function domIds(container: HTMLElement): string[] {
  return [...container.querySelectorAll('[role="option"]')].map((element) => element.id);
}

describe("createCollection", () => {
  it("orders items by DOM position, not registration order", async () => {
    let collection!: CreateCollectionReturn<string>;
    const { container, dispose } = mount(() => (
      <Listbox values={["a", "b", "c"]} onReady={(c) => (collection = c)} />
    ));

    await vi.waitFor(() => expect(collection.items()).toHaveLength(3));
    expect(ids(collection)).toEqual(domIds(container));
    dispose();
  });

  it("keeps DOM order when an item mounts before the others after the fact", async () => {
    let collection!: CreateCollectionReturn<string>;
    const [prepend, setPrepend] = createSignal(false);
    const { container, dispose } = mount(() => (
      <Show when={true}>
        {/* `prepend` renders first in the DOM but registers last. */}
        <Listbox
          values={["b", "c"]}
          prepend={prepend() ? "a" : undefined}
          onReady={(c) => (collection = c)}
        />
      </Show>
    ));

    await vi.waitFor(() => expect(collection.items()).toHaveLength(2));
    setPrepend(true);
    await vi.waitFor(() => expect(collection.items()).toHaveLength(3));

    // Registered last, but first in the DOM → first in `items()`.
    expect(ids(collection)).toEqual(domIds(container));
    expect(collection.items()[0]?.value()).toBe("a");
    dispose();
  });

  it("exposes a stable id at register time and an element that resolves only after mount", async () => {
    let handle!: CollectionItem<string>;
    let elementAtRegister: HTMLElement | undefined = "sentinel" as unknown as HTMLElement;
    const { dispose } = mount(() => (
      <ul role="listbox" aria-label="lifecycle">
        <Option
          collection={createCollection<string>()}
          value="x"
          onItem={(item) => {
            handle = item;
            // `onItem` runs during render, before the registration effect and before mount.
            // A deliberate untracked read — we are asserting the pre-mount value, not tracking it.
            elementAtRegister = untrack(() => item.element());
          }}
        />
      </ul>
    ));

    expect(typeof handle.id).toBe("string");
    expect(handle.id.length).toBeGreaterThan(0);
    expect(elementAtRegister).toBeUndefined();
    await vi.waitFor(() => expect(handle.element()).toBeInstanceOf(HTMLElement));
    dispose();
  });

  it("reflects reactive disabled, value and textValue metadata", async () => {
    let collection!: CreateCollectionReturn<string>;
    const { dispose } = mount(() => {
      collection = createCollection<string>();
      return (
        <ul role="listbox" aria-label="metadata">
          <Option collection={collection} value="apple" textValue="Granny Smith" disabled />
        </ul>
      );
    });

    await vi.waitFor(() => expect(collection.items()).toHaveLength(1));
    const [item] = collection.items();
    expect(item?.value()).toBe("apple");
    expect(item?.textValue()).toBe("Granny Smith");
    expect(item?.disabled()).toBe(true);
    dispose();
  });

  it("falls back to the element's trimmed text when textValue is omitted", async () => {
    let collection!: CreateCollectionReturn<string>;
    const { dispose } = mount(() => (
      <Listbox values={["Banana"]} onReady={(c) => (collection = c)} />
    ));

    await vi.waitFor(() => expect(collection.items()).toHaveLength(1));
    expect(collection.items()[0]?.textValue()).toBe("Banana");
    dispose();
  });

  it("removes an item from items() when it unmounts", async () => {
    let collection!: CreateCollectionReturn<string>;
    const [showC, setShowC] = createSignal(true);
    const { dispose } = mount(() => {
      collection = createCollection<string>();
      return (
        <ul role="listbox" aria-label="removable">
          <Option collection={collection} value="a" />
          <Option collection={collection} value="b" />
          <Show when={showC()}>
            <Option collection={collection} value="c" />
          </Show>
        </ul>
      );
    });

    await vi.waitFor(() => expect(collection.items()).toHaveLength(3));
    setShowC(false);
    await vi.waitFor(() => expect(collection.items()).toHaveLength(2));
    expect(collection.items().map((item) => item.value())).toEqual(["a", "b"]);
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let collection!: CreateCollectionReturn<string>;
    const { container, dispose } = mount(() => (
      <Listbox values={["a", "b", "c"]} onReady={(c) => (collection = c)} />
    ));
    await vi.waitFor(() => expect(collection.items()).toHaveLength(3));
    await expectNoA11yViolations(container);
    dispose();
  });
});
