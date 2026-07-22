import {
  type CreateListboxOptions,
  type CreateListboxReturn,
  createListbox,
} from "@hope-ui/primitives/listbox";
import { renderElement } from "@hope-ui/primitives/render";
import { runIfFunction } from "@hope-ui/primitives/utils";
import type { ListboxSize, ListboxThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Accessor, For, merge, omit, Show } from "solid-js";
import { CheckIcon } from "../icons";
import { ListboxContext, type ListboxContextValue } from "./listbox-context";

/**
 * `ListboxRootProps` = the primitive's `CreateListboxOptions<V>` (value/selection/focus/orientation +
 * the native-form fields) **plus** the themeable `size` axis (`ListboxThemeableProps`, owned by
 * `@hope-ui/theming`) **plus** the remaining native `<div>` attributes (so the list can be named with
 * `aria-label`/`aria-labelledby`, styled with `style`, etc.) and the per-instance props below. The
 * list element is a generic `<div role="listbox">` (not a `<ul>`) so that groups/separators — and, in
 * virtual mode, the sizer — nest as valid HTML; see the element-tag note on `Root` below.
 *
 * `CreateListboxOptions<V>` keys are `Omit`-ted from the native attributes so a native
 * `onChange`/`value`/`id`/`name`/`form`/`disabled` never clashes with the primitive's own (e.g. the
 * primitive's `onChange: (value: V[]) => void` vs the DOM change handler). Extending
 * `ListboxThemeableProps` keeps the recipe variants and this surface in lockstep by construction.
 */
export interface ListboxRootProps<V = unknown>
  extends CreateListboxOptions<V>,
    ListboxThemeableProps,
    Omit<
      JSX.HTMLAttributes<HTMLDivElement>,
      keyof CreateListboxOptions<V> | "onChange" | "children"
    > {
  /**
   * Per-instance class overrides, keyed by slot (`root`/`item`/`itemIndicator`/`group`/`groupLabel`/
   * `separator`). Folded in after the recipe base and the preset's global `slotClasses`. Set once here
   * to reach every part. Use literal class strings so the consumer's Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"listbox">;
  /** Merged over the recipe's `root` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * **Collection mode:** the self-registering `Listbox.Item` children (idiomatic Solid `<For>`).
   * **Virtual mode:** a **render-prop** `(item, index) => JSX.Element` invoked once per windowed row —
   * return a `<Listbox.Item index={index}>`. The mode is selected by `items` + `estimateSize` (see
   * `CreateListboxOptions`), never by the shape of this prop, so the render-prop form is only ever
   * called when virtualization is on.
   */
  children?: JSX.Element | ((item: V, index: Accessor<number>) => JSX.Element);
}

/**
 * The Listbox root. Calls `createListbox` once for the shared state (item source + focus/selection/
 * navigation/typeahead, ids, the pointer fight-guard, `rootProps`, and the form accessors), resolves
 * the recipe variants via `useDefaults` + `useSlots`, and puts the state + slot class fns on context
 * (composition — `ctx.state` + `ctx.slots`, not an extended state).
 *
 * **The list element is a `<div role="listbox">` in both modes** — not a `<ul>`. This is the
 * **valid-HTML decision**: a `<ul>` may contain only `<li>`/`<script>`/`<template>`, and an `<li>` is
 * valid only inside `<ul>`/`<ol>`/`<menu>`. A grouped listbox (`ul > div[role=group] > li[role=option]`),
 * a separator (`ul > div[role=presentation]`), and virtual mode's sizer (`ul > div > div[role=option]`)
 * all violate that. So every part is a **role-based generic element** — `<div role="listbox">` over
 * `<div role="group">` / `<div role="presentation">` / `<div role="option">` — where the ARIA `role`
 * (not the tag) carries the semantics, exactly as the browser-tested primitive harnesses
 * (`GroupedListbox`, `VirtualListbox`) do, and as every mainstream listbox (Radix, React Aria, Ariakit)
 * does. `role` overrides native element semantics for assistive tech, so nothing is lost by dropping
 * `<ul>`/`<li>`, and the markup validates at every nesting.
 *
 * **Collection mode (default).** Renders the `<div role="listbox">` (the standalone convenience binding
 * from `rootProps`, wired to the primitive via `setListboxElement`) with the consumer's parts inside —
 * `Item`/`Group`/`GroupLabel`/`Separator`, self-registering via `<For>`.
 *
 * **Virtual mode.** Selected when `items` + `estimateSize` are supplied (`state.source` is then the
 * `createVirtualCollection` windowing seam). The same `<div role="listbox">` becomes the **scroll
 * container**, holding a single **sizer** `<div>` of the full scroll height (`state.virtual.totalSize()`)
 * inside which only the windowed `virtualItems()` mount; the render-prop `children` is invoked once per
 * windowed row to produce its `Listbox.Item` (which self-positions + self-registers off its `index`).
 * Flat lists only — no `Group`/`GroupLabel`/`Separator`.
 *
 * In **both** modes, **followed by** — when `name` is set — one visually-hidden native field per
 * selected value, so the listbox submits with a form. The hidden inputs are **siblings of the list
 * element, never inside it** (an `<input>` is not a valid `listbox` child). The *decision of what to
 * submit* (`state.formValues()`) lives in the primitive over the **full** set (so virtual multi-select
 * submits offscreen selections too); this layer only maps it to inputs.
 *
 * `Listbox.Root<V>` is generic **at its props**; the `<V>` cannot flow through Solid context, so the
 * `createListbox<V>` return is cast to `CreateListboxReturn<unknown>` for the provider (see
 * `listbox-context.ts`). Because it reads a recipe, a `Listbox.Root` **requires a `<ThemeProvider>`**
 * ancestor fed a preset, like every other styled component.
 */
export function Root<V = unknown>(props: ListboxRootProps<V>): JSX.Element {
  // `useDefaults` folds the preset's per-component `defaultProps` in between the instance props and
  // these built-in defaults (precedence: instance ?? preset ?? builtin), resolving each key with `??`.
  // The `checkIcon` factory defaults to hope's built-in check; a preset's `defaultProps.listbox` swaps
  // it app-wide (and a per-`Listbox.Root` `checkIcon` prop wins over that).
  const merged = useDefaults({
    recipe: "listbox",
    props,
    defaults: {
      size: "md" as const,
      checkIcon: () => <CheckIcon />,
    },
  });

  // `useSlots` returns one ready-to-call class fn per slot, each folding the override chain: recipe
  // base → preset `slotClasses` → instance `slotClasses` → `class` (root slot only). `size` is the
  // whole styling axis; passing the complete variant set every call is what `CompleteVariantsOf`
  // requires (an omitted variant would silently fall back to the recipe's `defaultVariants`).
  const slots = useSlots({
    recipe: "listbox",
    variantsProps: () => ({ size: merged.size }),
    slotClasses: () => merged.slotClasses,
    class: () => merged.class,
  });

  // `createListbox` reads only its own option keys off `merged` (value/selection/focus/orientation/
  // name/…) — the defaulted `size` and the per-instance class props ride along harmlessly. Pass
  // `merged`, not raw `props`: `useDefaults` exposes its defaults as getters over `props`, so `merged`
  // stays just as lazy and reactive (the controllable-state getters stay live) while being the single
  // source of truth. Cast into the provider — the `<V>` cannot flow through Solid context.
  const state = createListbox<V>(merged);
  // The parts read behavior off `state`, classes off `slots`, and — when the `ItemIndicator` is given
  // no `children` — its default glyph off `checkIcon`. An accessor (via `runIfFunction`), so each read
  // builds a fresh glyph element from the resolved factory (instance ?? preset ?? built-in check).
  const context: ListboxContextValue = {
    state: state as unknown as CreateListboxReturn<unknown>,
    slots,
    checkIcon: () => runIfFunction(merged.checkIcon),
  };

  // The passthrough native attributes: everything not consumed as a `createListbox` option, a recipe
  // variant/override, or the explicitly-rendered `class`/`children`. `aria-label`/`style`/`data-*`
  // survive here; `state.rootProps` (spread after) owns `role`/`aria-*`/`tabindex`/`onKeyDown`/`id`.
  const rest = omit(
    merged,
    "size",
    "checkIcon",
    "slotClasses",
    "class",
    "children",
    "itemToValue",
    "itemToLabel",
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
    "items",
    "estimateSize",
    "overscan",
    "getItemDisabled",
    "name",
    "form",
    "required",
    "id",
  );

  // Virtual mode is chosen exactly as the primitive chooses it — both `items` and `estimateSize`
  // present — and never switches for the instance's lifetime, so it is read once here (the getters
  // ride along on `merged`). It drives whether `children` is the render-prop (per windowed row) or the
  // self-registering JSX. The list element is a `<div role="listbox">` either way (see the valid-HTML
  // note in the JSDoc).
  const virtualized = merged.estimateSize != null && merged.items != null;

  // The windowed body: a single **sizer** `<div>` of the full scroll height, inside which only the
  // rendered slice mounts, each row positioned absolutely at its `virtualItem.start`. The render-prop
  // `children` is invoked once per windowed row with `(item, () => index)`; it returns the row's
  // `Listbox.Item`, which self-registers + self-positions off `index`. A **function child invoked per
  // row is not the multi-read component-valued-prop shape**, so it needs no `children()` — the only
  // hydration hazard in virtual mode is windowing itself, handled by the relaxed SSR strategy (no
  // strict round-trip; see `listbox-virtual.ssr.test.tsx`). Declared as a nested component so its
  // `<For>` gets its own owner, and rendered **under the provider** (via the `children` getter below)
  // so each row's `Listbox.Item` resolves `useListboxContext()`.
  function VirtualSizer(): JSX.Element {
    const renderChild = merged.children as (item: V, index: Accessor<number>) => JSX.Element;
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
            renderChild(merged.items?.[virtualItem.index] as V, () => virtualItem.index)
          }
        </For>
      </div>
    );
  }

  // The list element — a `<div role="listbox">` in both modes (the scroll container in virtual mode),
  // assembled via `renderElement` (like every other component's host elements — Dialog, Calendar).
  // A literal element with a dynamic child does **not** hydrate: spreading the getter-laden `rootProps`
  // onto a literal element and giving it a reactive child shifts the children's hydration keys one
  // level between server and client. `renderElement` → `<Dynamic>` allocates the keys identically on
  // both. `rest` (consumer passthrough) is merged first, then `state.rootProps` so the primitive's
  // a11y-owned attrs (incl. `role="listbox"`) win, then the recipe `class` / `data-slot` / children.
  // `setListboxElement` wires the element to the primitive as its scroll container (`rootProps` omits
  // `ref`; `renderElement` also merges any consumer `ref`).
  const elementProps = merge(rest, state.rootProps, {
    get class(): string {
      return slots.root();
    },
    "data-slot": "listbox",
    get children(): JSX.Element {
      return virtualized ? <VirtualSizer /> : (merged.children as JSX.Element);
    },
  });

  return (
    <ListboxContext value={context}>
      {renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
        as: "div",
        props: elementProps as unknown as JSX.HTMLAttributes<HTMLElement>,
        ref: state.setListboxElement,
      })}
      {/* Native form submission, opt-in via `name`: one hidden field per selected value, valued
      `itemToValue(item)` (always a string) over the **full** set (offscreen virtual selections
      included). Siblings of the list element — an `<input>` is not a valid `listbox` child.
      Mirrors React Aria's `HiddenSelect`. */}
      <Show when={state.name()}>
        <For each={state.formValues()}>
          {(value) => <input type="hidden" name={state.name()} value={value} form={state.form()} />}
        </For>
      </Show>
    </ListboxContext>
  );
}

// Re-export the recipe vocabulary so consumers can import it from the component's subpath.
export type { ListboxSize };
