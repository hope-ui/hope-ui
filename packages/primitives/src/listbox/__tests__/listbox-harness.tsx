import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, For } from "solid-js";
import { composeEventHandlers } from "../../utils";
import {
  type CreateListboxOptions,
  type CreateListboxReturn,
  createListbox,
  createListboxGroup,
  createListboxGroupLabel,
  createListboxItem,
  createListboxSeparator,
} from "../index";

// Shared test support for the listbox family. It lives under `__tests__/` so `check:coverage-parity`
// treats it as test support rather than a source file owing its own test + doc.

/** Array access that asserts presence — under `noUncheckedIndexedAccess`, `list[i]` is `T | undefined`. */
export function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value === undefined) {
    throw new Error(`no element at index ${index}`);
  }
  return value;
}

/** Every harness owns the `items` it feeds `createListbox`, so a test tunes everything else. */
export type ListboxTestOptions<V, G = V> = Omit<CreateListboxOptions<V, G>, "items">;

export interface Fruit {
  id: number;
  name: string;
  disabled?: boolean;
}

export const FRUITS: Fruit[] = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
  { id: 4, name: "Date" },
];

export function fruitOptions(): ListboxTestOptions<Fruit> {
  return {
    itemToValue: (fruit) => String(fruit.id),
    itemToLabel: (fruit) => fruit.name,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────────────────────

export function listbox(container: HTMLElement): HTMLElement {
  return container.querySelector('[role="listbox"]') as HTMLElement;
}
export function options(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[role="option"]')];
}
export function tabindexes(container: HTMLElement): string[] {
  return options(container).map((element) => element.getAttribute("tabindex") ?? "");
}
export function activeValues(container: HTMLElement): string[] {
  return options(container)
    .filter((element) => element.hasAttribute("data-active"))
    .map((element) => element.dataset.value as string);
}
export function selectedValues(container: HTMLElement): string[] {
  return options(container)
    .filter((element) => element.getAttribute("aria-selected") === "true")
    .map((element) => element.dataset.value as string);
}

// ─── Data-mode harness (the default source) ─────────────────────────────────────────────────────

export interface DataListboxProps<V> {
  values: V[];
  labelOf: (value: V) => string;
  disabledOf?: (value: V) => boolean;
  ariaLabel?: string;
  options?: ListboxTestOptions<V>;
  onReady?: (state: CreateListboxReturn<V>) => void;
}

/**
 * A standalone `<ul role="listbox">` over an `items` array, wired through `rootProps`. Each row hands
 * the primitive the `item` it renders, which is what the hook resolves the row's index from.
 */
export function DataListbox<V>(props: DataListboxProps<V>): JSX.Element {
  const state = createListbox<V>({
    ...props.options,
    get items() {
      return props.values;
    },
    isItemDisabled: props.disabledOf,
  });
  props.onReady?.(state);

  return (
    <ul
      ref={(element) => state.setListboxElement(element)}
      {...state.rootProps}
      aria-label={props.ariaLabel ?? "fruits"}
    >
      <For each={props.values}>
        {(value) => {
          const [ref, setRef] = createSignal<HTMLLIElement>();
          const item = createListboxItem<V>(state, { ref, item: value });
          return (
            <li ref={setRef} {...item.props} data-value={props.labelOf(value)}>
              {props.labelOf(value)}
            </li>
          );
        }}
      </For>
    </ul>
  );
}

// ─── External-focus-owner harness (the Select shape) ──────────────────────────────────────────────

export interface SelectListboxProps<V> {
  values: V[];
  labelOf: (value: V) => string;
  options?: ListboxTestOptions<V>;
  onReady?: (state: CreateListboxReturn<V>) => void;
}

/**
 * The Select-ready shape: DOM focus lives on an external `<input role="combobox">`, which carries
 * `aria-activedescendant` and the navigation/typeahead key handlers, while the list is a passive
 * container. Pins that the focus primitives bind to an owner *outside* the list, with no `rootProps`.
 */
export function SelectListbox<V>(props: SelectListboxProps<V>): JSX.Element {
  const state = createListbox<V>({
    ...props.options,
    get items() {
      return props.values;
    },
    focusMode: "activedescendant",
  });
  props.onReady?.(state);

  return (
    <div>
      {/* The Select seam: DOM focus lives on the input, so *it* drives the highlight gate rather than
          the listbox container's focus-in/out — and it only sets the flag, deliberately without
          auto-highlighting an entry row. */}
      <input
        ref={(element) => state.setListboxElement(element)}
        role="combobox"
        aria-expanded="true"
        aria-controls={state.id()}
        aria-activedescendant={state.focus.activeDescendant()}
        aria-label="choose a fruit"
        onFocus={() => state.focus.setFocused(true)}
        onBlur={() => state.focus.setFocused(false)}
        onKeyDown={composeEventHandlers(state.navigation.onKeyDown, state.typeahead.onKeyDown)}
      />
      {/* Passive container: focus and activedescendant live on the input above, so the list is a plain
          div-based `role="listbox"` with no tabindex and no `rootProps`. */}
      <div id={state.id()} role="listbox" aria-label="fruits">
        <For each={props.values}>
          {(value) => {
            const [ref, setRef] = createSignal<HTMLDivElement>();
            const item = createListboxItem<V>(state, { ref, item: value });
            return (
              <div ref={setRef} {...item.props} data-value={props.labelOf(value)}>
                {props.labelOf(value)}
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}

// ─── Grouped harness (groups / labels / separators) ───────────────────────────────────────────────

export interface GroupSpec<V> {
  label: string;
  values: V[];
}

export interface GroupedListboxProps<V> {
  groups: GroupSpec<V>[];
  labelOf: (value: V) => string;
  // `groupToItems` is the harness's own; everything else in the option set is independent of `G`.
  options?: Omit<ListboxTestOptions<V>, "groupToItems">;
  onReady?: (state: CreateListboxReturn<V>) => void;
}

/** One group: a `role="group"` wrapper naming itself from its `GroupLabel`, holding its options. */
function Group<V>(props: {
  state: CreateListboxReturn<V>;
  spec: GroupSpec<V>;
  labelOf: (value: V) => string;
}): JSX.Element {
  const group = createListboxGroup();
  const label = createListboxGroupLabel(group);
  return (
    <div {...group.props}>
      <div {...label.props} data-group-label={props.spec.label}>
        {props.spec.label}
      </div>
      <For each={props.spec.values}>
        {(value) => {
          const [ref, setRef] = createSignal<HTMLDivElement>();
          const item = createListboxItem<V>(props.state, { ref, item: value });
          return (
            <div ref={setRef} {...item.props} data-value={props.labelOf(value)}>
              {props.labelOf(value)}
            </div>
          );
        }}
      </For>
    </div>
  );
}

/**
 * A grouped listbox — div-based, so nested groups stay valid HTML — with a `GroupLabel` per group and
 * a `Separator` between groups. `items` holds the **group entries**, and `groupToItems` flattens them
 * into navigation order. A row still resolves its own position from its `item`, which is what keeps
 * the inner iteration a plain `<For>`.
 */
export function GroupedListbox<V>(props: GroupedListboxProps<V>): JSX.Element {
  const state = createListbox<V, GroupSpec<V>>({
    ...props.options,
    get items() {
      return props.groups;
    },
    groupToItems: (group) => group.values,
  });
  props.onReady?.(state);

  return (
    <div
      ref={(element) => state.setListboxElement(element)}
      {...state.rootProps}
      role="listbox"
      aria-label="fruits by kind"
    >
      <For each={props.groups}>
        {(spec, groupIndex) => (
          <>
            {groupIndex() > 0 && <Separator />}
            <Group state={state} spec={spec} labelOf={props.labelOf} />
          </>
        )}
      </For>
    </div>
  );
}

/** Standalone separator element for direct assertions. */
export function Separator(props: JSX.HTMLAttributes<HTMLElement> = {}): JSX.Element {
  const separator = createListboxSeparator(props);
  return <div {...separator.props} data-testid="separator" />;
}

// ─── Virtual-mode harness ─────────────────────────────────────────────────────────────────────────

export interface VirtualListboxProps {
  count: number;
  rowHeight?: number;
  viewport?: number;
  options?: ListboxTestOptions<number>;
  onReady?: (state: CreateListboxReturn<number>) => void;
}

export function virtualLabel(index: number): string {
  return `Item ${index}`;
}

/**
 * A windowed listbox over `count` numeric rows. The `<div role="listbox">` is the scroll container,
 * and an inner element of `totalSize()` height gives it a real scrollbar while each mounted row is
 * placed by absolute `top`. Same structure as the `createVirtualCollection` browser test.
 */
export function VirtualListbox(props: VirtualListboxProps): JSX.Element {
  const rowHeight = props.rowHeight ?? 30;
  const viewport = props.viewport ?? 300;
  const data = Array.from({ length: props.count }, (_, index) => index);

  const state = createListbox<number>({
    items: data,
    estimateSize: () => rowHeight,
    itemToValue: (index) => `row-${index}`,
    itemToLabel: virtualLabel,
    overscan: 3,
    ...props.options,
  });
  props.onReady?.(state);

  return (
    <div
      ref={(element) => state.setListboxElement(element)}
      {...state.rootProps}
      role="listbox"
      aria-label="virtual fruits"
      style={{ height: `${viewport}px`, "overflow-y": "auto" }}
    >
      <div
        style={{
          height: `${state.virtual?.totalSize() ?? 0}px`,
          position: "relative",
          width: "100%",
        }}
      >
        <For each={state.virtual?.virtualItems() ?? []}>
          {(virtualItem) => {
            const [ref, setRef] = createSignal<HTMLDivElement>();
            const index: Accessor<number> = () => virtualItem.index;
            const item = createListboxItem<number>(state, { ref, index });
            return (
              <div
                ref={setRef}
                {...item.props}
                data-index={virtualItem.index}
                data-value={virtualLabel(virtualItem.index)}
                style={{
                  position: "absolute",
                  top: `${virtualItem.start}px`,
                  left: "0",
                  width: "100%",
                  height: `${rowHeight}px`,
                }}
              >
                {virtualLabel(virtualItem.index)}
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}

export function mountedIndices(container: HTMLElement): number[] {
  return [...container.querySelectorAll<HTMLElement>("[data-index]")]
    .map((element) => Number(element.dataset.index))
    .sort((a, b) => a - b);
}
