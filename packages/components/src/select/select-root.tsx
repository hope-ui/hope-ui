import {
  type CreateComboboxOptions,
  type CreateComboboxReturn,
  createCombobox,
} from "@hope-ui/primitives/combobox";
import { HiddenSelect } from "@hope-ui/primitives/hidden-select";
import type { SelectionMode } from "@hope-ui/primitives/internal";
import { runIfFunction } from "@hope-ui/primitives/utils";
import type { SelectSize, SelectThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { CheckIcon, ChevronDownIcon } from "../icons";
import { SelectContext, type SelectContextValue } from "./select-context";

/**
 * Props for `Select.Root`: every option the headless `createCombobox` hook takes (the `items` data,
 * the value/selection surface, open state, modality, dismissal, positioning, the native form fields)
 * plus the themeable `size` axis and the two chrome glyphs owned by `@hope-ui/theming`.
 *
 * `<V>` is your item type, `<M>` the selection mode — inferred from `selectionMode`, which is what
 * types `value`/`defaultValue`/`onChange` as a scalar or an array — and `<G>` the shape of an `items`
 * **entry**: the same as `<V>` for a flat list, the group's shape once `groupToItems` is set.
 *
 * `Root` renders no element of its own, so there is deliberately no `class`, no `render` and no
 * native-attribute passthrough. Style the parts, or reach every one at once with `slotClasses`.
 *
 * **Virtualization is deliberately absent** (`estimateSize`/`overscan` are `Omit`-ted). A windowed row
 * is recycled as you scroll, while `Select.Item` resolves its own position by looking its `item` up in
 * `items` — a lookup that is `-1` by construction in virtual mode, so every row would warn and
 * register nothing. Omitting the options makes that a compile error instead. Reach for `Listbox` when
 * you need a virtualized picker.
 */
export interface SelectRootProps<V = unknown, M extends SelectionMode = "single", G = V>
  extends Omit<CreateComboboxOptions<V, M, G>, "estimateSize" | "overscan">,
    SelectThemeableProps {
  /**
   * Per-instance class overrides, keyed by slot (`trigger`/`value`/`icon`/`positioner`/`content`/
   * `list`/`group`/`groupLabel`/`separator`/`item`/`itemText`/`itemIndicator`). Folded in after the
   * recipe base and the preset's global `slotClasses`. Set once here to reach every part. Use literal
   * class strings so the consumer's Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"select">;
  children?: JSX.Element;
}

/**
 * The Select root. Calls `createCombobox` once — the headless behavior hook from
 * `@hope-ui/primitives` that owns open state, the option list, the generated ids, the element refs,
 * popup positioning and the mount/unmount animation state — resolves the theme recipe, and shares
 * both on context. It renders only the provider and the hidden native `<select>`.
 *
 * **Options are data, and nothing renders until open.** `items` is the whole option set, held here
 * rather than in the popup: that is what lets a closed Select still run typeahead (jump to an option
 * by typing its first letters), still refuse to open an empty list, and still server-render every
 * `<option>` for browser autofill — without mounting a single row the user may never look at.
 *
 * **The visual positioning defaults land here, not in `createCombobox`.** A gap from the trigger and a
 * viewport gutter are look-and-feel, so they belong where a preset's `defaultProps.select` can
 * override them; someone using the headless hook directly keeps floating-ui's own zeroes.
 *
 * **The trigger needs an accessible name.** Select ships no `Label` part, so an `aria-label` — or an
 * `aria-labelledby` pointing at your own `<label>` — on `Select.Trigger` is mandatory: a nameless
 * `role="combobox"` is an axe `aria-input-field-name` violation, and so is the `role="listbox"` popup
 * that inherits its name from it.
 *
 * Reading a recipe means a `Select.Root` **requires a `<ThemeProvider>`** ancestor fed a preset.
 */
export function Root<V = unknown, M extends SelectionMode = "single", G = V>(
  props: SelectRootProps<V, M, G>,
): JSX.Element {
  // `useDefaults` resolves each key with `??`: instance prop ?? preset `defaultProps.select` ?? the
  // built-in below — so a preset can swap the glyphs app-wide while one `Select.Root` still overrides
  // that. `sideOffset` is the gap kept from the trigger, `collisionPadding` the one kept from the
  // viewport edge.
  const merged = useDefaults({
    recipe: "select",
    props,
    defaults: {
      size: "md" as const,
      chevronIcon: () => <ChevronDownIcon />,
      checkIcon: () => <CheckIcon />,
      sideOffset: 4,
      collisionPadding: 8,
    },
  });

  // `useSlots` returns one class fn per slot (`trigger`, `list`, `item`, …), each folding the override
  // chain recipe base → preset `slotClasses` → instance `slotClasses` → the part's own `class`. Pass
  // the *complete* variant set on every call: an omitted variant silently falls back to the recipe's
  // own `defaultVariants`.
  const slots = useSlots({
    recipe: "select",
    variantsProps: () => ({ size: merged.size }),
    slotClasses: () => merged.slotClasses,
  });

  // Pass `merged`, never the raw `props`. `useDefaults` copies nothing — it exposes the defaults as
  // getters over a new object — so `merged` stays lazy and reactive while being the single source of
  // truth, and a later read of `props` would still see `undefined` for every defaulted key.
  const state = createCombobox<V, M, G>(merged);

  const context: SelectContextValue = {
    // A Solid context value is one concrete type, so `<V>` is erased here and cast back per part.
    state: state as unknown as CreateComboboxReturn<unknown>,
    slots,
    // The consumer's array in the shape they passed it — items when flat, group entries under
    // `groupToItems`. `createCombobox` flattens its own copy into navigation order, so it has no group
    // boundaries left for `Select.List` to iterate.
    items: () => merged.items as readonly unknown[],
    // Accessors, so every read builds a fresh glyph element rather than reusing one node that would
    // then be moved out of the first place it was rendered.
    chevronIcon: () => runIfFunction(merged.chevronIcon),
    checkIcon: () => runIfFunction(merged.checkIcon),
  };

  return (
    <SelectContext value={context}>
      {merged.children}
      {/* Native form submission, opt-in via `name`: a real but visually clipped `<select>` carrying
      every `<option>`, server-side too, so browser autofill has the whole set to match against. It
      sits beside the children rather than in the popup, which is portaled out of the `<form>` and
      would submit nothing. `triggerRef` is where focus goes when a blocked `required` submit reports
      the field invalid — a clipped control cannot take that focus itself. */}
      <HiddenSelect state={state.list} triggerRef={state.triggerElement} />
    </SelectContext>
  );
}

export type { SelectSize };
