import {
  type CreateListboxOptions,
  type CreateListboxReturn,
  createListbox,
} from "@hope-ui/primitives/listbox";
import { renderElement } from "@hope-ui/primitives/render";
import type { ListboxSize, ListboxThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { For, merge, omit, Show } from "solid-js";
import { ListboxContext, type ListboxContextValue } from "./listbox-context";

/**
 * `ListboxRootProps` = the primitive's `CreateListboxOptions<V>` (value/selection/focus/orientation +
 * the native-form fields) **plus** the themeable `size` axis (`ListboxThemeableProps`, owned by
 * `@hope-ui/theming`) **plus** the remaining native `<ul>` attributes (so the list can be named with
 * `aria-label`/`aria-labelledby`, styled with `style`, etc.) and the per-instance props below.
 *
 * `CreateListboxOptions<V>` keys are `Omit`-ted from the native `<ul>` attributes so a native
 * `onChange`/`value`/`id`/`name`/`form`/`disabled` never clashes with the primitive's own (e.g. the
 * primitive's `onChange: (value: V[]) => void` vs the DOM change handler). Extending
 * `ListboxThemeableProps` keeps the recipe variants and this surface in lockstep by construction.
 */
export interface ListboxRootProps<V = unknown>
  extends CreateListboxOptions<V>,
    ListboxThemeableProps,
    Omit<JSX.HTMLAttributes<HTMLUListElement>, keyof CreateListboxOptions<V> | "onChange"> {
  /**
   * Per-instance class overrides, keyed by slot (`root`/`item`/`itemIndicator`/`group`/`groupLabel`/
   * `separator`). Folded in after the recipe base and the preset's global `slotClasses`. Set once here
   * to reach every part. Use literal class strings so the consumer's Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"listbox">;
  /** Merged over the recipe's `root` slot (applied last), so the consumer's utilities win. */
  class?: string;
  children?: JSX.Element;
}

/**
 * The Listbox root. Calls `createListbox` once for the shared state (item source + focus/selection/
 * navigation/typeahead, ids, the pointer fight-guard, `rootProps`, and the form accessors), resolves
 * the recipe variants via `useDefaults` + `useSlots`, and puts the state + slot class fns on context
 * (composition — `ctx.state` + `ctx.slots`, not an extended state).
 *
 * Renders a `<ul role="listbox">` (the standalone convenience binding from `rootProps`, wired to the
 * primitive via `setListboxElement`) with the consumer's parts inside, **followed by** — when `name`
 * is set — one visually-hidden native field per selected value, so the listbox submits with a form.
 * The hidden inputs are **siblings of the `<ul>`, never inside it** (an `<input>` is not a valid
 * `listbox` child). The *decision of what to submit* (`state.formValues()`) lives in the primitive;
 * this layer only maps it to inputs.
 *
 * `Listbox.Root<V>` is generic **at its props**; the `<V>` cannot flow through Solid context, so the
 * `createListbox<V>` return is cast to `CreateListboxReturn<unknown>` for the provider (see
 * `listbox-context.ts`). Because it reads a recipe, a `Listbox.Root` **requires a `<ThemeProvider>`**
 * ancestor fed a preset, like every other styled component.
 */
export function Root<V = unknown>(props: ListboxRootProps<V>): JSX.Element {
  // `useDefaults` folds the preset's per-component `defaultProps` in between the instance props and
  // this built-in default (precedence: instance ?? preset ?? builtin), resolving each key with `??`.
  const merged = useDefaults({
    recipe: "listbox",
    props,
    defaults: {
      size: "md" as const,
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
  const context: ListboxContextValue = {
    state: state as unknown as CreateListboxReturn<unknown>,
    slots,
  };

  // The passthrough native attributes: everything not consumed as a `createListbox` option, a recipe
  // variant/override, or the explicitly-rendered `class`/`children`. `aria-label`/`style`/`data-*`
  // survive here; `state.rootProps` (spread after) owns `role`/`aria-*`/`tabindex`/`onKeyDown`/`id`.
  const rest = omit(
    merged,
    "size",
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

  // The standalone `<ul role="listbox">`, assembled via `renderElement` (like every other component's
  // host elements — Dialog, Calendar). A literal `<ul {...state.rootProps}>` with a dynamic child
  // does **not** hydrate: spreading the getter-laden `rootProps` onto a literal element and giving it
  // a reactive child shifts the children's hydration keys one level between server and client.
  // `renderElement` → `<Dynamic>` allocates the keys identically on both. `rest` (consumer passthrough)
  // is merged first, then `state.rootProps` so the primitive's a11y-owned attrs win, then the recipe
  // `class` / `data-slot` / children. `setListboxElement` wires the element to the primitive
  // (`rootProps` omits `ref`; `renderElement` also merges any consumer `ref`).
  const elementProps = merge(rest, state.rootProps, {
    get class(): string {
      return slots.root();
    },
    "data-slot": "listbox",
    get children(): JSX.Element {
      return merged.children;
    },
  });

  return (
    <ListboxContext value={context}>
      {renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
        as: "ul",
        props: elementProps as unknown as JSX.HTMLAttributes<HTMLElement>,
        ref: state.setListboxElement,
      })}
      {/* Native form submission, opt-in via `name`: one hidden field per selected value, valued
      `itemToValue(item)` (always a string). Siblings of the `<ul>` — an `<input>` is not a valid
      `listbox` child. Mirrors React Aria's `HiddenSelect`. */}
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
