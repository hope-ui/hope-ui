import { HiddenSelect } from "@hope-ui/primitives/hidden-select";
import {
  type CreateListboxOptions,
  type CreateListboxReturn,
  createListbox,
} from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { runIfFunction } from "@hope-ui/primitives/utils";
import type { ListboxSize, ListboxThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, For, merge, omit } from "solid-js";
import { CheckIcon } from "../icons";
import { ListboxContext, type ListboxContextValue } from "./listbox-context";

// The list element is a `<div role="listbox">`, not a `<ul>` — see the valid-HTML note on `Root` —
// so there are no `<ul>`-specific attributes to inherit.
type ListboxRootElementProps = JSX.HTMLAttributes<HTMLDivElement>;

/**
 * `ListboxRootProps` = the `createListbox` options (the `items` data, value/selection/focus/
 * orientation, the native-form fields) **plus** the themeable `size` axis **plus** the remaining
 * native `<div>` attributes (`aria-label`, `style`, `data-*`, …) and the per-instance props below.
 *
 * `<V>` is your item type and `<G>` the shape of an `items` **entry**. They are the same for a flat
 * list; with `groupToItems` set, `items` holds group entries and `<G>` is inferred from it.
 *
 * The `createListbox` option keys are `Omit`-ted from the native attributes so a DOM
 * `onChange`/`value`/`id`/`name`/`form`/`disabled` can never clash with the option of the same name
 * (the option's `onChange: (value: V[]) => void` is not the DOM change handler). Extending
 * `ListboxThemeableProps` keeps the style recipe's variants and this surface in lockstep.
 */
export interface ListboxRootProps<V = unknown, G = V>
  extends CreateListboxOptions<V, G>,
    ListboxThemeableProps,
    Omit<ListboxRootElementProps, keyof CreateListboxOptions<V, G> | "onChange" | "children"> {
  /**
   * Per-instance class overrides, keyed by slot (`root`/`item`/`itemIndicator`/`group`/`groupLabel`/
   * `separator`). Folded in after the recipe base and the preset's global `slotClasses`. Set once here
   * to reach every part. Use literal class strings so the consumer's Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"listbox">;
  /**
   * Renders the list container as a different element/component while keeping Root's computed props
   * (`role="listbox"`, the ARIA, the tab stop, the keyboard handling). **Not** the same thing as the
   * per-row `children` callback below — this re-targets the container, that one builds a row.
   *
   * Your element receives a single function `ref` with the component's own ref merged in. In virtual
   * mode that element *is* the scroll container, so a target that ignores function refs silently
   * breaks windowing.
   */
  render?: RenderProp<ListboxRootElementProps>;
  /** Merged over the recipe's `root` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * A **render callback invoked once per `items` entry** — the single authoring mode. It receives the
   * entry and its position, and returns that entry's markup:
   *
   * - **flat** (the default) — one call per *item*; return a `<Listbox.Item item={item}>`.
   * - **grouped** (`groupToItems` set) — one call per *group entry*; return a `<Listbox.Group>` and
   *   iterate the group's own items with a plain `<For>`. Each `Listbox.Item` still resolves its own
   *   row from its `item`, so nesting depth is irrelevant. `index` is what a `<Listbox.Separator />`
   *   between groups keys off.
   * - **virtual** (`estimateSize` set) — one call per *windowed row*; return a
   *   `<Listbox.Item index={index}>`, since a recycled row's position is the only thing it knows.
   *
   * Typing the parameter is the one annotation this costs: `<G>` cannot flow through Solid context,
   * so the callback arrives as `unknown` at a nested part and is annotated once here.
   */
  children?: (entry: G, index: Accessor<number>) => JSX.Element;
}

/**
 * The Listbox root. Calls `createListbox` once for the state every part shares (the item source,
 * focus/selection/navigation/typeahead, ids, the form accessors), resolves the theme recipe, and
 * publishes both on context.
 *
 * **Options are data.** `items` is required and holds the whole option set; rows come from the
 * `children` callback, once per entry. Nothing self-registers, so the option list — and typeahead,
 * selection and submitted form values over it — exists whether or not a row is mounted. That is the
 * property a Select is built on.
 *
 * **The list element is a `<div role="listbox">` in both modes, never a `<ul>`**, because the `<ul>`
 * markup would be *invalid*: a `<ul>` may contain only `<li>`/`<script>`/`<template>`, and an `<li>`
 * is valid only directly inside `<ul>`/`<ol>`/`<menu>`. Groups, separators and virtual mode's sizer
 * all sit between the list and its options and would each break that. So every part is a generic
 * element carrying an ARIA `role` instead — `role` overrides native element semantics for assistive
 * tech, so nothing is lost, and the markup validates at any nesting.
 *
 * **Data mode (default)** renders that element over a `<For>` of `items`. **Virtual mode**, selected
 * by passing `estimateSize`, makes the same element the **scroll container**, holding one sizer
 * `<div>` of the full scroll height inside which only the visible window of rows mounts. Virtual mode
 * is flat lists only — no `Group`/`GroupLabel`/`Separator`.
 *
 * In both modes, setting `name` appends a hidden native form control so the listbox submits with a
 * `<form>`, autofills, honours `required` and survives a form `reset`. It is a **sibling of the list
 * element, never inside it**: neither an `<input>` nor a `<select>` is a valid `listbox` child.
 *
 * `Listbox.Root<V, G>` is generic **at its props** only — a Solid context value is a single concrete
 * type, so the state is widened on the way in and narrowed back at each part (see
 * `listbox-context.ts`). Reading a recipe means it **requires a `<ThemeProvider>`** ancestor fed a
 * preset, like every other styled component.
 */
export function Root<V = unknown, G = V>(props: ListboxRootProps<V, G>): JSX.Element {
  // `useDefaults` resolves each key with `??` across three layers: instance prop, then the preset's
  // per-component `defaultProps`, then the built-ins below. So a preset can swap the selection check
  // glyph app-wide while a per-instance `checkIcon` still wins over it.
  const merged = useDefaults({
    recipe: "listbox",
    props,
    defaults: {
      size: "md" as const,
      checkIcon: () => <CheckIcon />,
    },
  });

  // One class function per named slot of the theme's `listbox` recipe, each folding the override
  // chain: recipe base → preset `slotClasses` → instance `slotClasses` → `class` (root slot only).
  // Every variant must be passed on every call: an omitted one silently falls back to the recipe's
  // own default rather than to this instance's.
  const slots = useSlots({
    recipe: "listbox",
    variantsProps: () => ({ size: merged.size }),
    slotClasses: () => merged.slotClasses,
  });

  // Pass `merged`, never raw `props`: `useDefaults` returns a *new object of getters* rather than a
  // copy, so `props.size` still reads `undefined` for a defaulted key while `merged.size` reads `md`.
  // Getters also keep everything lazy and reactive. `createListbox` picks off only the option keys it
  // knows; `size` and the class props ride along harmlessly.
  const state = createListbox<V, G>(merged);
  // `checkIcon` is an *accessor*, so each read builds a fresh glyph element — a single shared element
  // would be moved from row to row instead of appearing in each.
  const context: ListboxContextValue = {
    state: state as unknown as CreateListboxReturn<unknown>,
    slots,
    checkIcon: () => runIfFunction(merged.checkIcon),
  };

  // The native attributes to forward: everything not consumed as a `createListbox` option, a recipe
  // input, or the explicitly-rendered `class`/`children`. `aria-label`/`style`/`data-*` survive here;
  // `state.rootProps`, merged after, owns `role`/`aria-*`/`tabindex`/`onKeyDown`/`id`.
  //
  // This list is hand-kept, and a key missing from it lands in the DOM as a junk attribute with
  // nothing else failing. `dir` is dropped here and re-added explicitly below, so that "make this
  // list exhaustive over the option keys" — the natural tidy-up — cannot silently split the layout
  // from the keyboard. See the `dir` getter for why.
  const rest = omit(
    merged,
    "dir",
    "size",
    "checkIcon",
    "slotClasses",
    "render",
    "class",
    "children",
    "items",
    "groupToItems",
    "itemToValue",
    "itemToLabel",
    "isItemDisabled",
    "value",
    "defaultValue",
    "onChange",
    "isItemEqualToValue",
    "selectionMode",
    "focusMode",
    "orientation",
    "disabled",
    "skipDisabled",
    "wrap",
    "estimateSize",
    "overscan",
    "name",
    "form",
    "required",
    "id",
  );

  // Virtual mode is selected exactly as the primitive selects it — `estimateSize` present — and never
  // switches for an instance's lifetime, so reading it once is safe. It changes only what the
  // `children` callback is invoked *over*: the visible window, or every `items` entry.
  const virtualized = merged.estimateSize != null;

  // The rows. A nested component, not inline JSX, for two reasons: its `<For>` gets a reactive scope
  // of its own, and it is rendered *under* the context provider (through the `children` getter
  // below), which is what lets each row's `Listbox.Item` read the context at all.
  //
  // A function invoked once per row is not the "component-valued prop read more than once" shape, so
  // it needs no `children()` call to stabilise hydration.
  function ListboxRows(): JSX.Element {
    const renderRow = merged.children ?? (() => undefined);
    if (!virtualized) {
      return <For each={merged.items}>{(entry, index) => renderRow(entry, index)}</For>;
    }
    return (
      <div
        data-slot="listbox-sizer"
        style={{
          position: "relative",
          width: "100%",
          height: `${state.virtual?.totalSize() ?? 0}px`,
        }}
      >
        <For each={state.virtual?.virtualItems() ?? []}>
          {(virtualItem) =>
            renderRow(merged.items[virtualItem.index] as G, () => virtualItem.index)
          }
        </For>
      </div>
    );
  }

  // Merge order is the precedence: the consumer's forwarded attributes first, then `state.rootProps`
  // so the accessibility attributes the primitive owns (`role="listbox"` and friends) win, then this
  // layer's class and markers.
  //
  // The element itself goes through `renderElement` rather than being written as a literal `<div>`.
  // Spreading a getter-backed props object onto a *literal* host element and giving it a reactive
  // child makes Solid's server and client compilers allocate the children's hydration keys one level
  // apart, so hydration silently fails to adopt them. Routing through a component call allocates them
  // identically on both sides.
  const elementProps = merge(rest, state.rootProps, {
    get class(): string {
      return slots.root(merged.class);
    },
    "data-slot": "listbox",
    // `dir` is the one `createListbox` option that is also a real HTML attribute, and the two halves
    // of right-to-left support arrive by different routes: the CSS mirrors itself from the DOM's
    // direction, while the arrow keys are remapped from the resolved direction in JS. So a consumer's
    // `dir` must reach the element, or `<Listbox.Root dir="rtl">` navigates right-to-left across a
    // row the browser still lays out left-to-right.
    //
    // `merged.dir`, never the resolved direction: that one falls back to the locale, and a
    // locale-derived `dir="ltr"` would override a `dir="rtl"` inherited from an ancestor. An app
    // declares direction where the browser can see it; a locale provider only tells the keyboard
    // mapping. When the two disagree, the primitive warns in dev rather than papering over it.
    get dir() {
      return merged.dir;
    },
    get children(): JSX.Element {
      return <ListboxRows />;
    },
  });

  // The list element is needed in two places: by the primitive (as its scroll container) and by
  // `HiddenSelect`, which focuses it when a blocked submit reports the field invalid — a visually
  // hidden control cannot take that focus itself. The primitive exposes only a setter, so the second
  // consumer needs a signal of its own.
  const [listElement, setListElement] = createSignal<HTMLElement | null>();
  const setElement = (element: HTMLDivElement) => {
    state.setListboxElement(element);
    setListElement(element);
  };

  return (
    <ListboxContext value={context}>
      {/* Typed over the element this actually renders, so a consumer's
      `render={(p) => <div {...p} />}` compiles with no cast. Only the `ref` parameter type differs
      from the primitive's wider `HTMLElement`, hence the props cast below. */}
      {renderElement<ListboxRootElementProps, HTMLDivElement>({
        as: "div",
        render: merged.render,
        props: elementProps as unknown as ListboxRootElementProps,
        ref: setElement,
      })}
      {/* Native form submission, opt-in via `name`. `HiddenSelect` renders the real control — a
      visually clipped `<select>` while the option set is small enough for browser autofill to be
      worth it, one `<input>` per value past that — and owns every decision about what to submit.
      A **sibling** of the list element, never inside it: neither an `<input>` nor a `<select>` is a
      valid `listbox` child. */}
      <HiddenSelect state={state} triggerRef={listElement} />
    </ListboxContext>
  );
}

// Re-exported so a consumer never has to reach into `@hope-ui/theming` for a type this component's
// own props use.
export type { ListboxSize };
